package com.rainbowforest.minigameservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.minigameservice.domain.GameReward;
import com.rainbowforest.minigameservice.domain.GameUserLimit;
import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.domain.MiniGamePlaySession;
import com.rainbowforest.minigameservice.dto.GamePlayRequest;
import com.rainbowforest.minigameservice.dto.config.*;
import com.rainbowforest.minigameservice.dto.response.*;
import com.rainbowforest.minigameservice.repository.GameRewardRepository;
import com.rainbowforest.minigameservice.repository.GameUserLimitRepository;
import com.rainbowforest.minigameservice.repository.MiniGamePlaySessionRepository;
import com.rainbowforest.minigameservice.repository.MiniGameRepository;
import com.rainbowforest.minigameservice.service.engine.GameEngineRegistry;
import com.rainbowforest.minigameservice.service.engine.GameExecutionResult;
import com.rainbowforest.minigameservice.service.reward.RewardEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.OptionalLong;
import java.util.ArrayList;
import org.springframework.data.domain.PageRequest;

@Service
@Transactional
public class UserMiniGameService {

    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Autowired
    private MiniGameRepository miniGameRepository;

    @Autowired
    private GameRewardRepository gameRewardRepository;

    @Autowired
    private MiniGamePlaySessionRepository playSessionRepository;

    @Autowired
    private GameUserLimitRepository gameUserLimitRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private MiniGameValidationService miniGameValidationService;

    @Autowired
    private GameEngineRegistry gameEngineRegistry;

    @Autowired
    private RewardEngine rewardEngine;

    @Autowired
    private MiniGameEventPublisher miniGameEventPublisher;

    @Autowired
    private ObjectMapper objectMapper;

    public List<GameResponse> getAvailableGames(Long userId) {
        return miniGameRepository.findByDeletedFalseAndStatusIgnoreCaseAndVisibleTrueOrderByFeaturedDescUpdatedAtDesc(ACTIVE_STATUS).stream()
                .map(game -> toPublicGameCard(game, userId))
                .toList();
    }

    public GameDetailResponse getGameDetail(String slug, Long userId) {
        MiniGame game = findVisibleGameBySlug(slug);
        
        GameplayConfigDTO gameplay = null;
        UiConfigDTO ui = null;
        ThemeConfigDTO theme = null;
        RewardConfigDTO reward = null;
        AnalyticsConfigDTO analytics = null;
        
        try {
            if (game.getGameplayConfig() != null && !game.getGameplayConfig().isBlank()) {
                gameplay = objectMapper.readValue(game.getGameplayConfig(), GameplayConfigDTO.class);
            }
            if (game.getUiConfig() != null && !game.getUiConfig().isBlank()) {
                ui = objectMapper.readValue(game.getUiConfig(), UiConfigDTO.class);
            }
            if (game.getThemeConfig() != null && !game.getThemeConfig().isBlank()) {
                theme = objectMapper.readValue(game.getThemeConfig(), ThemeConfigDTO.class);
            }
            if (game.getRewardConfig() != null && !game.getRewardConfig().isBlank()) {
                reward = objectMapper.readValue(game.getRewardConfig(), RewardConfigDTO.class);
            }
            if (game.getAnalyticsConfig() != null && !game.getAnalyticsConfig().isBlank()) {
                analytics = objectMapper.readValue(game.getAnalyticsConfig(), AnalyticsConfigDTO.class);
            }
        } catch (Exception e) {
            // Ignore parse errors, fall back to null
        }

        if (gameplay == null) {
            gameplay = new GameplayConfigDTO();
            if ("MEMORY_MATCH".equalsIgnoreCase(game.getType())) {
                gameplay.setGridSize("4x4");
                gameplay.setTimer(60);
            }
        }

        return GameDetailResponse.builder()
                .id(game.getId())
                .name(game.getName())
                .slug(game.getSlug())
                .type(game.getType())
                .thumbnailUrl(game.getThumbnailUrl())
                .bannerUrl(game.getBannerUrl())
                .shortDescription(game.getShortDescription())
                .description(game.getDescription())
                .rules(game.getRules())
                .dailyPlayLimit(game.getDailyPlayLimit())
                .status(game.getStatus())
                .visible(game.getVisible())
                .version(game.getVersion())
                .gameplayConfig(gameplay)
                .uiConfig(ui)
                .themeConfig(theme)
                .rewardConfig(reward)
                .analyticsConfig(analytics)
                .rewards(getPublicRewards(game.getId()))
                .remainingPlays(getRemainingPlays(userId, game))
                .rewardRange(buildRewardRange(game.getId()))
                .build();
    }

    public ProfileSummaryResponse getMySummary(Long userId) {
        List<MiniGamePlaySession> sessions = playSessionRepository.findByUserIdOrderByPlayedAtDesc(userId);
        long totalPlays = sessions.size();
        long totalPoints = sessions.stream().mapToLong(session -> session.getPointEarned() != null ? session.getPointEarned() : 0L).sum();
        long totalVouchers = sessions.stream().filter(session -> session.getVoucherId() != null && !session.getVoucherId().isBlank()).count();

        List<ProfileSummaryResponse.GameSummaryResponse> gameSummaries = miniGameRepository
                .findByDeletedFalseAndStatusIgnoreCaseAndVisibleTrueOrderByFeaturedDescUpdatedAtDesc(ACTIVE_STATUS)
                .stream()
                .map(game -> {
                    long gamePlays = sessions.stream().filter(session -> Objects.equals(session.getGame().getId(), game.getId())).count();
                    long gamePoints = sessions.stream()
                            .filter(session -> Objects.equals(session.getGame().getId(), game.getId()))
                            .mapToLong(session -> session.getPointEarned() != null ? session.getPointEarned() : 0L)
                            .sum();
                    long gameVouchers = sessions.stream()
                            .filter(session -> Objects.equals(session.getGame().getId(), game.getId()))
                            .filter(session -> session.getVoucherId() != null && !session.getVoucherId().isBlank())
                            .count();
                            
                    return ProfileSummaryResponse.GameSummaryResponse.builder()
                            .gameId(game.getId())
                            .gameName(game.getName())
                            .slug(game.getSlug())
                            .plays(gamePlays)
                            .points(gamePoints)
                            .vouchers(gameVouchers)
                            .remainingPlays(getRemainingPlays(userId, game))
                            .lastPlayedAt(sessions.stream()
                                    .filter(session -> Objects.equals(session.getGame().getId(), game.getId()))
                                    .map(MiniGamePlaySession::getPlayedAt)
                                    .filter(Objects::nonNull)
                                    .findFirst()
                                    .orElse(null))
                            .build();
                })
                .toList();

        return ProfileSummaryResponse.builder()
                .totalPlays(totalPlays)
                .totalPoints(totalPoints)
                .totalVouchers(totalVouchers)
                .lastPlayedAt(sessions.isEmpty() ? null : sessions.getFirst().getPlayedAt())
                .recentHistory(sessions.stream().limit(10).map(this::toHistoryItem).toList())
                .games(gameSummaries)
                .build();
    }

    public List<HistoryResponse> getMyHistory(Long userId) {
        return playSessionRepository.findByUserIdOrderByPlayedAtDesc(userId).stream()
                .map(this::toHistoryItem)
                .toList();
    }

    public PlayGameResponse playGame(Long gameId, Long userId, GamePlayRequest request, String deviceInfo, String ipAddress) {
        MiniGame game = miniGameRepository.findByIdAndDeletedFalse(gameId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay game"));
        miniGameValidationService.validatePlayRequest(game, request);

        String lockKey = "minigame:play:" + gameId + ":" + userId + ":" + LocalDate.now(BUSINESS_ZONE);
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Luot choi dang duoc xu ly, vui long thu lai");
        }

        try {
            GameUserLimit limit = getOrCreateLimit(userId, game);
            if (limit.getUsedCount() >= limit.getMaxCount()) {
                throw new RuntimeException("Ban da het luot choi hom nay");
            }

            GameExecutionResult executionResult = gameEngineRegistry.getEngine(game).execute(game, request);
            GameReward reward = executionResult.rewardEligible() ? rewardEngine.selectReward(game.getId()) : null;
            long earnedPoints = reward != null && ("POINT".equalsIgnoreCase(reward.getRewardType()) || "POINTS".equalsIgnoreCase(reward.getRewardType())) && reward.getPointValue() != null
                    ? reward.getPointValue()
                    : 0L;
            String voucherId = reward != null && "VOUCHER".equalsIgnoreCase(reward.getRewardType())
                    ? reward.getVoucherId()
                    : null;
            
            Integer timeTaken = null;
            if (request != null && request.playData() != null && request.playData().containsKey("timeTakenSeconds")) {
                Object tt = request.playData().get("timeTakenSeconds");
                if (tt instanceof Number) {
                    timeTaken = ((Number) tt).intValue();
                }
            }

            boolean completed = executionResult.rewardEligible();
            String status = completed ? "COMPLETED" : "FAILED";
            String result = completed ? (reward == null ? "NO_REWARD" : "REWARDED") : "FAILED";

            Map<String, Object> normData = executionResult.normalizedPlayData();
            Integer matchedPairs = normData.containsKey("matchedPairs") ? ((Number) normData.get("matchedPairs")).intValue() : null;
            Integer attempts = normData.containsKey("attempts") ? ((Number) normData.get("attempts")).intValue() : null;
            Integer duration = normData.containsKey("durationSeconds") ? ((Number) normData.get("durationSeconds")).intValue() : null;

            MiniGamePlaySession session = MiniGamePlaySession.builder()
                    .userId(userId)
                    .game(game)
                    .reward(reward)
                    .score(executionResult.normalizedScore())
                    .pointEarned(earnedPoints > 0 ? earnedPoints : null)
                    .voucherId(voucherId)
                    .result(result)
                    .timeTakenSeconds(timeTaken)
                    .playDataJson(serializePlayData(executionResult.normalizedPlayData()))
                    .deviceInfo(trimToNull(deviceInfo))
                    .ipAddress(trimToNull(ipAddress))
                    .status(status)
                    .build();
            MiniGamePlaySession savedSession = playSessionRepository.save(session);

            if (reward != null && reward.getRemainingQuantity() != null && reward.getRemainingQuantity() > 0) {
                reward.setRemainingQuantity(reward.getRemainingQuantity() - 1);
                gameRewardRepository.save(reward);
            }

            limit.setUsedCount(limit.getUsedCount() + 1);
            limit.setMaxCount(game.getDailyPlayLimit());
            gameUserLimitRepository.save(limit);

            if (reward != null) {
                miniGameEventPublisher.publishRewardGranted(userId, savedSession.getId(), game.getCode(), reward);
            }

            return PlayGameResponse.builder()
                    .success(true)
                    .status(status)
                    .reason(completed ? null : "GAME_OVER")
                    .completed(completed)
                    .matchedPairs(matchedPairs)
                    .attempts(attempts)
                    .duration(duration)
                    .message(completed ? "Chúc mừng bạn đã hoàn thành trò chơi!" : "Bạn chưa hoàn thành trò chơi.")
                    .sessionId(savedSession.getId())
                    .gameId(game.getId())
                    .gameName(game.getName())
                    .result(savedSession.getResult())
                    .score(savedSession.getScore())
                    .playedAt(savedSession.getPlayedAt())
                    .remainingPlays(Math.max(0, limit.getMaxCount() - limit.getUsedCount()))
                    .reward(reward == null ? null : toPublicRewardRow(reward))
                    .pointEarned(earnedPoints)
                    .voucherId(voucherId)
                    .build();
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    public List<LeaderboardResponse> getLeaderboard(Long gameId, String period) {
        List<Object[]> rawData;
        PageRequest pageRequest = PageRequest.of(0, 50);
        
        if ("today".equalsIgnoreCase(period)) {
            rawData = playSessionRepository.findTopPlayersByGameIdAndPeriod(gameId, LocalDate.now(BUSINESS_ZONE).atStartOfDay(), pageRequest);
        } else if ("weekly".equalsIgnoreCase(period)) {
            rawData = playSessionRepository.findTopPlayersByGameIdAndPeriod(gameId, LocalDate.now(BUSINESS_ZONE).minusDays(7).atStartOfDay(), pageRequest);
        } else if ("monthly".equalsIgnoreCase(period)) {
            rawData = playSessionRepository.findTopPlayersByGameIdAndPeriod(gameId, LocalDate.now(BUSINESS_ZONE).minusMonths(1).atStartOfDay(), pageRequest);
        } else {
            rawData = playSessionRepository.findTopPlayersByGameId(gameId, pageRequest);
        }
        
        List<LeaderboardResponse> result = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rawData) {
            Long rowUserId = (Long) row[0];
            Long totalPoints = (Long) row[1];
            Long playCount = row.length > 2 ? (Long) row[2] : 1L;
            Integer bestTime = row.length > 3 ? (Integer) row[3] : null;
            
            result.add(LeaderboardResponse.builder()
                    .userId(rowUserId)
                    .displayName("Người chơi #" + rowUserId)
                    .avatarUrl(null)
                    .score(totalPoints)
                    .rank(rank++)
                    .playCount(playCount)
                    .bestTime(bestTime)
                    .build());
        }
        return result;
    }

    public List<HistoryResponse> getRecentWinners(Long gameId) {
        return playSessionRepository.findRecentWinnersByGameId(gameId, PageRequest.of(0, 10)).stream()
                .map(this::toHistoryItem)
                .toList();
    }

    public StatisticResponse getGameStatistics(Long gameId) {
        long totalPlays = playSessionRepository.countByGame_Id(gameId);
        long totalPlayers = playSessionRepository.countDistinctUsersByGameId(gameId);
        long totalPointsEarned = playSessionRepository.sumPointEarnedByGameId(gameId);
        long totalVouchers = playSessionRepository.countByGame_IdAndVoucherIdIsNotNull(gameId);
        
        return StatisticResponse.builder()
                .totalPlays(totalPlays)
                .totalPlayers(totalPlayers)
                .totalPointsEarned(totalPointsEarned)
                .totalVouchersDistributed(totalVouchers)
                .build();
    }

    public List<RewardResponse> getTopRewards(Long gameId) {
        return getPublicRewards(gameId);
    }

    public List<Object> getMyMissions(Long userId) {
        // Return empty list safely from DB (no mock data) since missions table isn't fully required yet
        return new ArrayList<>();
    }

    private MiniGame findVisibleGameBySlug(String slug) {
        MiniGame game = miniGameRepository.findBySlugIgnoreCaseAndDeletedFalse(slug)
                .orElseThrow(() -> new RuntimeException("Khong tim thay game"));
        miniGameValidationService.validateGamePlayable(game);
        return game;
    }

    private GameUserLimit getOrCreateLimit(Long userId, MiniGame game) {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        return gameUserLimitRepository.findByUserIdAndGame_IdAndPlayDate(userId, game.getId(), today)
                .orElseGet(() -> gameUserLimitRepository.save(GameUserLimit.builder()
                        .userId(userId)
                        .game(game)
                        .playDate(today)
                        .usedCount(0)
                        .maxCount(game.getDailyPlayLimit())
                        .build()));
    }

    private int getRemainingPlays(Long userId, MiniGame game) {
        if (userId == null) {
            return game.getDailyPlayLimit() != null ? game.getDailyPlayLimit() : 0;
        }
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        return gameUserLimitRepository.findByUserIdAndGame_IdAndPlayDate(userId, game.getId(), today)
                .map(limit -> Math.max(0, limit.getMaxCount() - limit.getUsedCount()))
                .orElse(game.getDailyPlayLimit() != null ? game.getDailyPlayLimit() : 0);
    }

    private String serializePlayData(Map<String, Object> playData) {
        if (playData == null || playData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(playData);
        } catch (JsonProcessingException exception) {
            throw new RuntimeException("Khong the luu du lieu luot choi");
        }
    }

    private GameResponse toPublicGameCard(MiniGame game, Long userId) {
        return GameResponse.builder()
                .id(game.getId())
                .name(game.getName())
                .slug(game.getSlug())
                .code(game.getCode())
                .type(game.getType())
                .thumbnailUrl(game.getThumbnailUrl())
                .bannerUrl(game.getBannerUrl())
                .shortDescription(game.getShortDescription())
                .dailyPlayLimit(game.getDailyPlayLimit())
                .remainingPlays(getRemainingPlays(userId, game))
                .featured(game.getFeatured())
                .rewardRange(buildRewardRange(game.getId()))
                .rewards(getPublicRewards(game.getId()))
                .build();
    }

    private List<RewardResponse> getPublicRewards(Long gameId) {
        return gameRewardRepository.findByGame_IdAndStatusIgnoreCaseOrderByCreatedAtDesc(gameId, ACTIVE_STATUS).stream()
                .filter(reward -> reward.getRemainingQuantity() == null || reward.getRemainingQuantity() > 0)
                .map(this::toPublicRewardRow)
                .toList();
    }

    private String buildRewardRange(Long gameId) {
        List<GameReward> rewards = gameRewardRepository.findByGame_IdAndStatusIgnoreCaseOrderByCreatedAtDesc(gameId, ACTIVE_STATUS);
        OptionalLong min = rewards.stream()
                .filter(reward -> reward.getPointValue() != null)
                .mapToLong(GameReward::getPointValue)
                .min();
        OptionalLong max = rewards.stream()
                .filter(reward -> reward.getPointValue() != null)
                .mapToLong(GameReward::getPointValue)
                .max();
        long voucherCount = rewards.stream().filter(reward -> reward.getVoucherId() != null && !reward.getVoucherId().isBlank()).count();

        if (min.isPresent() && max.isPresent() && voucherCount > 0) {
            return min.getAsLong() + " - " + max.getAsLong() + " diem, voucher";
        }
        if (min.isPresent() && max.isPresent()) {
            return min.getAsLong() + " - " + max.getAsLong() + " diem";
        }
        if (voucherCount > 0) {
            return "Voucher";
        }
        return "Dang cap nhat";
    }

    private RewardResponse toPublicRewardRow(GameReward reward) {
        return RewardResponse.builder()
                .id(reward.getId())
                .rewardName(reward.getRewardName())
                .rewardType(reward.getRewardType())
                .pointValue(reward.getPointValue())
                .voucherId(reward.getVoucherId())
                .probability(reward.getProbability())
                .remainingQuantity(reward.getRemainingQuantity())
                .build();
    }

    private HistoryResponse toHistoryItem(MiniGamePlaySession session) {
        return HistoryResponse.builder()
                .id(session.getId())
                .gameId(session.getGame().getId())
                .gameName(session.getGame().getName())
                .slug(session.getGame().getSlug())
                .result(session.getResult())
                .score(session.getScore())
                .pointEarned(session.getPointEarned())
                .voucherId(session.getVoucherId())
                .playedAt(session.getPlayedAt())
                .rewardName(session.getReward() != null ? session.getReward().getRewardName() : "Chuc ban may man lan sau")
                .build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
