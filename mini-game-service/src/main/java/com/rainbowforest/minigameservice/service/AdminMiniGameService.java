package com.rainbowforest.minigameservice.service;

import com.rainbowforest.minigameservice.domain.GameReward;
import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.domain.MiniGamePlaySession;
import com.rainbowforest.minigameservice.dto.GameRewardUpsertRequest;
import com.rainbowforest.minigameservice.dto.MiniGameUpsertRequest;
import com.rainbowforest.minigameservice.repository.GameRewardRepository;
import com.rainbowforest.minigameservice.repository.MiniGamePlaySessionRepository;
import com.rainbowforest.minigameservice.repository.MiniGameRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional
public class AdminMiniGameService {

    @Autowired
    private MiniGameRepository miniGameRepository;

    @Autowired
    private GameRewardRepository gameRewardRepository;

    @Autowired
    private MiniGamePlaySessionRepository playSessionRepository;

    @Autowired
    private MiniGameValidationService miniGameValidationService;

    @Autowired
    private GameActivityLogService gameActivityLogService;

    @Autowired
    private ObjectMapper objectMapper;

    public Map<String, Object> getDashboard() {
        List<MiniGame> games = miniGameRepository.findByDeletedFalseOrderByFeaturedDescUpdatedAtDesc();
        List<MiniGamePlaySession> recentSessions = playSessionRepository.findAllFrom(LocalDate.now().minusDays(6).atStartOfDay());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGames", games.size());
        summary.put("activeGames", games.stream().filter(game -> "ACTIVE".equalsIgnoreCase(game.getStatus())).count());
        summary.put("totalPlays", games.stream().mapToLong(game -> playSessionRepository.countByGame_Id(game.getId())).sum());
        summary.put("players", playSessionRepository.countDistinctUsers());
        summary.put("totalPoints", playSessionRepository.sumAllPointEarned());
        summary.put("voucherRewards", playSessionRepository.countByVoucherIdIsNotNull());

        List<Map<String, Object>> playTrend = new ArrayList<>();
        List<Map<String, Object>> playerTrend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            List<MiniGamePlaySession> sessionsForDate = recentSessions.stream()
                    .filter(session -> session.getPlayedAt() != null && session.getPlayedAt().toLocalDate().equals(date))
                    .toList();
            playTrend.add(Map.of("date", date.format(formatter), "plays", sessionsForDate.size()));
            playerTrend.add(Map.of("date", date.format(formatter), "players", sessionsForDate.stream().map(MiniGamePlaySession::getUserId).distinct().count()));
        }

        List<Map<String, Object>> distribution = games.stream()
                .map(game -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", game.getName());
                    item.put("value", playSessionRepository.countByGame_Id(game.getId()));
                    item.put("type", game.getType());
                    return item;
                })
                .filter(item -> ((Long) item.get("value")) > 0)
                .toList();

        List<Map<String, Object>> topGames = games.stream()
                .map(game -> {
                    long plays = playSessionRepository.countByGame_Id(game.getId());
                    long players = playSessionRepository.countDistinctUsersByGameId(game.getId());
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", game.getId());
                    item.put("name", game.getName());
                    item.put("thumbnailUrl", game.getThumbnailUrl());
                    item.put("plays", plays);
                    item.put("players", players);
                    item.put("growth", calculateGrowthPercent(plays, recentSessions, game.getId()));
                    return item;
                })
                .sorted((left, right) -> Long.compare((Long) right.get("plays"), (Long) left.get("plays")))
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("playTrend", playTrend);
        response.put("playerTrend", playerTrend);
        response.put("distribution", distribution);
        response.put("topGames", topGames);
        response.put("games", games.stream().map(this::toGameRow).toList());
        return response;
    }

    public Map<String, Object> getGames(String search, String type, String status, Boolean visible, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<MiniGame> result = miniGameRepository.findAll(buildGameSpecification(search, type, status, visible), pageable);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", result.getContent().stream().map(this::toGameRow).toList());
        response.put("page", result.getNumber());
        response.put("size", result.getSize());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("empty", result.isEmpty());
        return response;
    }

    public Map<String, Object> getGame(Long id) {
        MiniGame game = findGame(id);
        Map<String, Object> response = new LinkedHashMap<>(toGameRow(game));
        response.put("description", game.getDescription());
        response.put("rules", game.getRules());
        response.put("rewards", getRewards(game.getId(), null, null, null));
        response.put("analytics", getAnalytics(game.getId()));
        response.put("activityLogs", gameActivityLogService.getByGameId(game.getId()));
        return response;
    }

    public Map<String, Object> createGame(MiniGameUpsertRequest request, Long actorId) {
        miniGameValidationService.validateGameRequest(request, null);
        MiniGame game = MiniGame.builder().build();
        applyGameRequest(game, request, actorId, true);
        MiniGame savedGame = miniGameRepository.save(game);
        gameActivityLogService.log(savedGame, actorId, "GAME_CREATED", "Admin tao mini game", Map.of(
                "code", savedGame.getCode(),
                "type", savedGame.getType(),
                "status", savedGame.getStatus()
        ));
        return toGameRow(savedGame);
    }

    public Map<String, Object> updateGame(Long id, MiniGameUpsertRequest request, Long actorId) {
        miniGameValidationService.validateGameRequest(request, id);
        MiniGame game = findGame(id);
        applyGameRequest(game, request, actorId, false);
        MiniGame savedGame = miniGameRepository.save(game);
        gameActivityLogService.log(savedGame, actorId, "GAME_UPDATED", "Admin cap nhat mini game", Map.of(
                "code", savedGame.getCode(),
                "version", savedGame.getVersion(),
                "visible", savedGame.getVisible()
        ));
        return toGameRow(savedGame);
    }

    public Map<String, Object> updateStatus(Long id, String status, Long actorId) {
        MiniGame game = findGame(id);
        String normalizedStatus = normalizeText(status).toUpperCase(Locale.ROOT);
        if (!MiniGameValidationService.ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new RuntimeException("Trang thai game khong hop le");
        }
        game.setStatus(normalizedStatus);
        game.setUpdatedBy(actorLabel(actorId));
        MiniGame savedGame = miniGameRepository.save(game);
        gameActivityLogService.log(savedGame, actorId, "GAME_STATUS_UPDATED", "Admin doi trang thai game", Map.of("status", normalizedStatus));
        return toGameRow(savedGame);
    }

    public void softDelete(Long id, Long actorId) {
        MiniGame game = findGame(id);
        game.setDeleted(Boolean.TRUE);
        game.setDeletedAt(LocalDateTime.now());
        game.setUpdatedBy(actorLabel(actorId));
        miniGameRepository.save(game);
        gameActivityLogService.log(game, actorId, "GAME_DELETED", "Admin xoa mem mini game", Map.of("deleted", true));
    }

    public List<Map<String, Object>> getRewards(Long gameId, String search, String rewardType, String status) {
        List<GameReward> rewards = gameId == null
                ? gameRewardRepository.findAll()
                : gameRewardRepository.findByGame_IdOrderByCreatedAtDesc(gameId);

        String normalizedSearch = normalizeText(search).toLowerCase(Locale.ROOT);
        String normalizedRewardType = normalizeText(rewardType).toUpperCase(Locale.ROOT);
        String normalizedStatus = normalizeText(status).toUpperCase(Locale.ROOT);

        return rewards.stream()
                .filter(reward -> normalizedSearch.isBlank()
                        || containsIgnoreCase(reward.getRewardName(), normalizedSearch)
                        || containsIgnoreCase(reward.getVoucherId(), normalizedSearch)
                        || containsIgnoreCase(reward.getGame().getName(), normalizedSearch))
                .filter(reward -> normalizedRewardType.isBlank() || "ALL".equals(normalizedRewardType)
                        || normalizedRewardType.equalsIgnoreCase(reward.getRewardType()))
                .filter(reward -> normalizedStatus.isBlank() || "ALL".equals(normalizedStatus)
                        || normalizedStatus.equalsIgnoreCase(reward.getStatus()))
                .sorted(Comparator.comparing((GameReward reward) -> reward.getGame().getName())
                        .thenComparing(GameReward::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toRewardRow)
                .toList();
    }

    public Map<String, Object> createReward(Long gameId, GameRewardUpsertRequest request, Long actorId) {
        MiniGame game = findGame(gameId);
        miniGameValidationService.validateRewardRequest(request, gameId, null);
        GameReward reward = GameReward.builder().game(game).build();
        applyRewardRequest(reward, request);
        GameReward savedReward = gameRewardRepository.save(reward);
        gameActivityLogService.log(game, actorId, "REWARD_CREATED", "Admin them phan thuong", Map.of(
                "rewardId", savedReward.getId(),
                "rewardType", savedReward.getRewardType(),
                "probability", savedReward.getProbability()
        ));
        return toRewardRow(savedReward);
    }

    public Map<String, Object> updateReward(Long rewardId, GameRewardUpsertRequest request, Long actorId) {
        GameReward reward = gameRewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phan thuong"));
        miniGameValidationService.validateRewardRequest(request, reward.getGame().getId(), rewardId);
        applyRewardRequest(reward, request);
        GameReward savedReward = gameRewardRepository.save(reward);
        gameActivityLogService.log(savedReward.getGame(), actorId, "REWARD_UPDATED", "Admin cap nhat phan thuong", Map.of(
                "rewardId", savedReward.getId(),
                "remainingQuantity", savedReward.getRemainingQuantity(),
                "status", savedReward.getStatus()
        ));
        return toRewardRow(savedReward);
    }

    public void deleteReward(Long rewardId, Long actorId) {
        GameReward reward = gameRewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phan thuong"));
        gameActivityLogService.log(reward.getGame(), actorId, "REWARD_DELETED", "Admin xoa phan thuong", Map.of(
                "rewardId", reward.getId(),
                "rewardName", reward.getRewardName()
        ));
        gameRewardRepository.deleteById(rewardId);
    }

    public Map<String, Object> getAnalytics(Long gameId) {
        MiniGame game = findGame(gameId);
        List<MiniGamePlaySession> sessions = playSessionRepository.findByGame_IdOrderByPlayedAtDesc(gameId);
        long totalPlays = sessions.size();
        long players = sessions.stream().map(MiniGamePlaySession::getUserId).distinct().count();
        long totalPoints = sessions.stream().mapToLong(session -> session.getPointEarned() != null ? session.getPointEarned() : 0L).sum();
        long vouchers = sessions.stream().filter(session -> session.getVoucherId() != null && !session.getVoucherId().isBlank()).count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", game.getId());
        summary.put("name", game.getName());
        summary.put("thumbnailUrl", game.getThumbnailUrl());
        summary.put("status", game.getStatus());
        summary.put("totalPlays", totalPlays);
        summary.put("players", players);
        summary.put("totalPoints", totalPoints);
        summary.put("voucherRewards", vouchers);

        LocalDate startDate = LocalDate.now().minusDays(29);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        List<Map<String, Object>> playTrend = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            LocalDate date = startDate.plusDays(i);
            long plays = sessions.stream()
                    .filter(session -> session.getPlayedAt() != null && session.getPlayedAt().toLocalDate().equals(date))
                    .count();
            playTrend.add(Map.of("date", date.format(formatter), "plays", plays));
        }

        Map<String, Long> deviceBuckets = new LinkedHashMap<>();
        deviceBuckets.put("Mobile", 0L);
        deviceBuckets.put("Desktop", 0L);
        deviceBuckets.put("Tablet", 0L);
        deviceBuckets.put("Other", 0L);
        sessions.forEach(session -> {
            String key = detectDeviceBucket(session.getDeviceInfo());
            deviceBuckets.put(key, deviceBuckets.getOrDefault(key, 0L) + 1);
        });

        List<Map<String, Object>> deviceDistribution = deviceBuckets.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .filter(entry -> ((Long) entry.get("value")) > 0)
                .toList();

        List<Map<String, Object>> rewardDistribution = gameRewardRepository.findByGame_IdOrderByCreatedAtDesc(gameId).stream()
                .map(reward -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", reward.getRewardName());
                    item.put("value", sessions.stream()
                            .filter(session -> session.getReward() != null && Objects.equals(session.getReward().getId(), reward.getId()))
                            .count());
                    return item;
                })
                .filter(entry -> ((Long) entry.get("value")) > 0)
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("playTrend", playTrend);
        response.put("deviceDistribution", deviceDistribution);
        response.put("rewardDistribution", rewardDistribution);
        response.put("history", sessions.stream().limit(20).map(this::toHistoryRow).toList());
        response.put("activityLogs", gameActivityLogService.getByGameId(gameId));
        response.put("recentPlaySessions", buildPlaySessionRows(sessions.stream().limit(50).toList()));
        return response;
    }

    public List<Map<String, Object>> getPlaySessions(Long gameId, Long userId, LocalDate fromDate, LocalDate toDate, int limit) {
        List<MiniGamePlaySession> sessions = playSessionRepository.findAll(Sort.by(Sort.Direction.DESC, "playedAt"));
        return buildPlaySessionRows(sessions.stream()
                .filter(session -> gameId == null || Objects.equals(session.getGame().getId(), gameId))
                .filter(session -> userId == null || Objects.equals(session.getUserId(), userId))
                .filter(session -> fromDate == null || (session.getPlayedAt() != null && !session.getPlayedAt().toLocalDate().isBefore(fromDate)))
                .filter(session -> toDate == null || (session.getPlayedAt() != null && !session.getPlayedAt().toLocalDate().isAfter(toDate)))
                .limit(Math.max(limit, 1))
                .toList());
    }

    public String exportRewards(Long gameId, String search, String rewardType, String status) {
        return toCsv(
                List.of("Game", "Reward Name", "Reward Type", "Point Value", "Voucher Id", "Probability", "Total Quantity", "Remaining Quantity", "Status", "Updated At"),
                getRewards(gameId, search, rewardType, status).stream()
                        .map(row -> List.of(
                                asCsvValue(row.get("gameName")),
                                asCsvValue(row.get("rewardName")),
                                asCsvValue(row.get("rewardType")),
                                asCsvValue(row.get("pointValue")),
                                asCsvValue(row.get("voucherId")),
                                asCsvValue(row.get("probability")),
                                asCsvValue(row.get("totalQuantity")),
                                asCsvValue(row.get("remainingQuantity")),
                                asCsvValue(row.get("status")),
                                asCsvValue(row.get("updatedAt"))
                        ))
                        .toList()
        );
    }

    public String exportPlaySessions(Long gameId, Long userId, LocalDate fromDate, LocalDate toDate, int limit) {
        return toCsv(
                List.of("Played At", "Game", "User Id", "Result", "Score", "Point Earned", "Voucher Id", "Device", "IP", "Reward"),
                getPlaySessions(gameId, userId, fromDate, toDate, limit).stream()
                        .map(row -> List.of(
                                asCsvValue(row.get("playedAt")),
                                asCsvValue(row.get("gameName")),
                                asCsvValue(row.get("userId")),
                                asCsvValue(row.get("result")),
                                asCsvValue(row.get("score")),
                                asCsvValue(row.get("pointEarned")),
                                asCsvValue(row.get("voucherId")),
                                asCsvValue(row.get("deviceInfo")),
                                asCsvValue(row.get("ipAddress")),
                                asCsvValue(row.get("rewardName"))
                        ))
                        .toList()
        );
    }

    public String exportActivityLogs(Long gameId) {
        return toCsv(
                List.of("Created At", "Game", "Actor Id", "Action Type", "Action Detail", "Metadata"),
                gameActivityLogService.getByGameId(gameId).stream()
                        .map(row -> List.of(
                                asCsvValue(row.get("createdAt")),
                                asCsvValue(row.get("gameName")),
                                asCsvValue(row.get("actorId")),
                                asCsvValue(row.get("actionType")),
                                asCsvValue(row.get("actionDetail")),
                                asCsvValue(row.get("metadataJson"))
                        ))
                        .toList()
        );
    }

    private Specification<MiniGame> buildGameSpecification(String search, String type, String status, Boolean visible) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isFalse(root.get("deleted")));

            String normalizedSearch = normalizeText(search);
            if (!normalizedSearch.isBlank()) {
                String keyword = "%" + normalizedSearch.toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("slug")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("shortDescription")), keyword)
                ));
            }

            String normalizedType = normalizeText(type).toUpperCase(Locale.ROOT);
            if (!normalizedType.isBlank() && !"ALL".equals(normalizedType)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("type")), normalizedType));
            }

            String normalizedStatus = normalizeText(status).toUpperCase(Locale.ROOT);
            if (!normalizedStatus.isBlank() && !"ALL".equals(normalizedStatus)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("status")), normalizedStatus));
            }

            if (visible != null) {
                predicates.add(criteriaBuilder.equal(root.get("visible"), visible));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void applyGameRequest(MiniGame game, MiniGameUpsertRequest request, Long actorId, boolean creating) {
        game.setName(request.name().trim());
        game.setSlug(request.slug().trim());
        game.setCode(request.code().trim().toUpperCase(Locale.ROOT));
        game.setType(request.type().trim().toUpperCase(Locale.ROOT));
        game.setThumbnailUrl(trimToNull(request.thumbnailUrl()));
        game.setBannerUrl(trimToNull(request.bannerUrl()));
        game.setShortDescription(trimToNull(request.shortDescription()));
        game.setDescription(trimToNull(request.description()));
        game.setRules(trimToNull(request.rules()));
        game.setDailyPlayLimit(request.dailyPlayLimit() != null ? request.dailyPlayLimit() : 0);
        game.setStatus(request.status().trim().toUpperCase(Locale.ROOT));
        game.setVisible(Boolean.TRUE.equals(request.visible()));
        game.setFeatured(Boolean.TRUE.equals(request.featured()));
        game.setVersion(request.version().trim());
        if (request.gameplayConfig() != null) {
            try {
                game.setGameplayConfig(objectMapper.writeValueAsString(request.gameplayConfig()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Lỗi cấu hình gameplay");
            }
        } else {
            game.setGameplayConfig(null);
        }
        game.setDeleted(Boolean.FALSE);
        game.setDeletedAt(null);
        if (creating) {
            game.setCreatedBy(actorLabel(actorId));
        }
        game.setUpdatedBy(actorLabel(actorId));
    }

    private void applyRewardRequest(GameReward reward, GameRewardUpsertRequest request) {
        reward.setRewardName(request.rewardName().trim());
        reward.setRewardType(request.rewardType().trim().toUpperCase(Locale.ROOT));
        reward.setPointValue("POINT".equalsIgnoreCase(request.rewardType()) ? request.pointValue() : null);
        reward.setVoucherId("VOUCHER".equalsIgnoreCase(request.rewardType()) ? trimToNull(request.voucherId()) : null);
        reward.setProbability(request.probability().setScale(2, RoundingMode.HALF_UP));
        reward.setTotalQuantity(request.totalQuantity());
        reward.setRemainingQuantity(request.remainingQuantity());
        reward.setStatus(request.status().trim().toUpperCase(Locale.ROOT));
    }

    private MiniGame findGame(Long id) {
        return miniGameRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay game"));
    }

    private Map<String, Object> toGameRow(MiniGame game) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", game.getId());
        row.put("name", game.getName());
        row.put("slug", game.getSlug());
        row.put("code", game.getCode());
        row.put("type", game.getType());
        row.put("thumbnailUrl", game.getThumbnailUrl());
        row.put("bannerUrl", game.getBannerUrl());
        row.put("shortDescription", game.getShortDescription());
        row.put("dailyPlayLimit", game.getDailyPlayLimit());
        row.put("status", game.getStatus());
        row.put("visible", game.getVisible());
        row.put("featured", game.getFeatured());
        row.put("version", game.getVersion());
        if (game.getGameplayConfig() != null) {
            try {
                row.put("gameplayConfig", objectMapper.readValue(game.getGameplayConfig(), new TypeReference<Map<String, Object>>() {}));
            } catch (JsonProcessingException e) {
                row.put("gameplayConfig", null);
            }
        } else {
            row.put("gameplayConfig", null);
        }
        row.put("createdAt", game.getCreatedAt());
        row.put("updatedAt", game.getUpdatedAt());
        row.put("totalPlays", playSessionRepository.countByGame_Id(game.getId()));
        row.put("players", playSessionRepository.countDistinctUsersByGameId(game.getId()));
        row.put("rewardCount", gameRewardRepository.countByGame_Id(game.getId()));
        row.put("analyticsPath", "/api/admin/mini-games/" + game.getId() + "/analytics");
        return row;
    }

    private Map<String, Object> toRewardRow(GameReward reward) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", reward.getId());
        row.put("gameId", reward.getGame().getId());
        row.put("gameName", reward.getGame().getName());
        row.put("rewardName", reward.getRewardName());
        row.put("rewardType", reward.getRewardType());
        row.put("pointValue", reward.getPointValue());
        row.put("voucherId", reward.getVoucherId());
        row.put("probability", reward.getProbability());
        row.put("totalQuantity", reward.getTotalQuantity());
        row.put("remainingQuantity", reward.getRemainingQuantity());
        row.put("status", reward.getStatus());
        row.put("createdAt", reward.getCreatedAt());
        row.put("updatedAt", reward.getUpdatedAt());
        return row;
    }

    private List<Map<String, Object>> buildPlaySessionRows(List<MiniGamePlaySession> sessions) {
        return sessions.stream().map(this::toHistoryRow).toList();
    }

    private Map<String, Object> toHistoryRow(MiniGamePlaySession session) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", session.getId());
        row.put("userId", session.getUserId());
        row.put("gameId", session.getGame().getId());
        row.put("gameName", session.getGame().getName());
        row.put("result", session.getResult());
        row.put("score", session.getScore());
        row.put("pointEarned", session.getPointEarned());
        row.put("voucherId", session.getVoucherId());
        row.put("playedAt", session.getPlayedAt());
        row.put("deviceInfo", session.getDeviceInfo());
        row.put("ipAddress", session.getIpAddress());
        row.put("rewardName", session.getReward() != null ? session.getReward().getRewardName() : null);
        row.put("playDataJson", session.getPlayDataJson());
        return row;
    }

    private double calculateGrowthPercent(long totalPlays, List<MiniGamePlaySession> recentSessions, Long gameId) {
        if (totalPlays == 0) {
            return 0.0;
        }
        LocalDateTime currentWindowStart = LocalDate.now().minusDays(6).atStartOfDay();
        long previous = recentSessions.stream()
                .filter(session -> Objects.equals(session.getGame().getId(), gameId))
                .filter(session -> session.getPlayedAt() != null && session.getPlayedAt().isBefore(currentWindowStart))
                .count();
        long current = recentSessions.stream()
                .filter(session -> Objects.equals(session.getGame().getId(), gameId))
                .filter(session -> session.getPlayedAt() != null && !session.getPlayedAt().isBefore(currentWindowStart))
                .count();
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((current - previous) * 1000.0 / previous)) / 10.0;
    }

    private String detectDeviceBucket(String deviceInfo) {
        String normalized = normalizeText(deviceInfo).toLowerCase(Locale.ROOT);
        if (normalized.contains("iphone") || normalized.contains("android") || normalized.contains("mobile")) {
            return "Mobile";
        }
        if (normalized.contains("ipad") || normalized.contains("tablet")) {
            return "Tablet";
        }
        if (normalized.contains("windows") || normalized.contains("mac") || normalized.contains("linux") || normalized.contains("desktop")) {
            return "Desktop";
        }
        return "Other";
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private String toCsv(List<String> headers, List<List<String>> rows) {
        StringBuilder builder = new StringBuilder();
        builder.append(String.join(",", headers)).append('\n');
        for (List<String> row : rows) {
            builder.append(String.join(",", row)).append('\n');
        }
        return builder.toString();
    }

    private String asCsvValue(Object value) {
        String raw = value == null ? "" : String.valueOf(value);
        String escaped = raw.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private String actorLabel(Long actorId) {
        return actorId != null ? "admin:" + actorId : "admin:system";
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimToNull(String value) {
        String normalized = normalizeText(value);
        return normalized.isEmpty() ? null : normalized;
    }
}
