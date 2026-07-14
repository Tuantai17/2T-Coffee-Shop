package com.rainbowforest.minigameservice.service;

import com.rainbowforest.minigameservice.domain.GameReward;
import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.dto.GamePlayRequest;
import com.rainbowforest.minigameservice.dto.GameRewardUpsertRequest;
import com.rainbowforest.minigameservice.dto.MiniGameUpsertRequest;
import com.rainbowforest.minigameservice.repository.GameRewardRepository;
import com.rainbowforest.minigameservice.repository.MiniGameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class MiniGameValidationService {

    public static final String ACTIVE_STATUS = "ACTIVE";
    public static final Set<String> ALLOWED_GAME_TYPES = Set.of("MEMORY_MATCH", "LUCKY_SPIN");
    public static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "INACTIVE");
    public static final Set<String> ALLOWED_REWARD_TYPES = Set.of("POINT", "VOUCHER");

    @Autowired
    private MiniGameRepository miniGameRepository;

    @Autowired
    private GameRewardRepository gameRewardRepository;

    public void validateGameRequest(MiniGameUpsertRequest request, Long gameId) {
        if (request == null) {
            throw new RuntimeException("Du lieu game khong hop le");
        }

        String normalizedType = normalize(request.type()).toUpperCase(Locale.ROOT);
        if (!ALLOWED_GAME_TYPES.contains(normalizedType)) {
            throw new RuntimeException("Chi ho tro MEMORY_MATCH va LUCKY_SPIN");
        }

        String normalizedStatus = normalize(request.status()).toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new RuntimeException("Trang thai game khong hop le");
        }

        if (normalize(request.name()).isBlank() || normalize(request.slug()).isBlank() || normalize(request.code()).isBlank()) {
            throw new RuntimeException("Ten, slug va code game la bat buoc");
        }

        if (request.dailyPlayLimit() == null || request.dailyPlayLimit() < 0) {
            throw new RuntimeException("dailyPlayLimit phai >= 0");
        }

        miniGameRepository.findByCodeIgnoreCase(request.code().trim())
                .filter(existing -> !Objects.equals(existing.getId(), gameId))
                .ifPresent(existing -> {
                    throw new RuntimeException("Code game da ton tai");
                });

        miniGameRepository.findBySlugIgnoreCase(request.slug().trim())
                .filter(existing -> !Objects.equals(existing.getId(), gameId))
                .ifPresent(existing -> {
                    throw new RuntimeException("Slug game da ton tai");
                });
    }

    public void validateRewardRequest(GameRewardUpsertRequest request, Long gameId, Long rewardId) {
        if (request == null) {
            throw new RuntimeException("Du lieu phan thuong khong hop le");
        }

        String normalizedType = normalize(request.rewardType()).toUpperCase(Locale.ROOT);
        if (!ALLOWED_REWARD_TYPES.contains(normalizedType)) {
            throw new RuntimeException("Loai phan thuong chi ho tro POINT hoac VOUCHER");
        }
        if (normalize(request.rewardName()).isBlank()) {
            throw new RuntimeException("Ten phan thuong la bat buoc");
        }
        if (request.probability() == null || request.probability().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Xac suat phan thuong phai >= 0");
        }
        if ("POINT".equals(normalizedType) && (request.pointValue() == null || request.pointValue() <= 0)) {
            throw new RuntimeException("Phan thuong POINT can pointValue > 0");
        }
        if ("VOUCHER".equals(normalizedType) && normalize(request.voucherId()).isBlank()) {
            throw new RuntimeException("Phan thuong VOUCHER can voucherId");
        }
        if (request.totalQuantity() == null || request.totalQuantity() < 0 || request.remainingQuantity() == null || request.remainingQuantity() < 0) {
            throw new RuntimeException("So luong phan thuong phai >= 0");
        }
        if (request.remainingQuantity() > request.totalQuantity()) {
            throw new RuntimeException("So luong con lai khong duoc lon hon tong so luong");
        }

        BigDecimal nextTotalProbability = gameRewardRepository.findByGame_IdOrderByCreatedAtDesc(gameId).stream()
                .filter(existing -> !Objects.equals(existing.getId(), rewardId))
                .map(GameReward::getProbability)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(request.probability());

        if (nextTotalProbability.compareTo(new BigDecimal("100")) > 0) {
            throw new RuntimeException("Tong xac suat phan thuong khong duoc vuot qua 100%");
        }
    }

    public void validateGamePlayable(MiniGame game) {
        if (game == null) {
            throw new RuntimeException("Khong tim thay game");
        }
        if (!ACTIVE_STATUS.equalsIgnoreCase(game.getStatus())) {
            throw new RuntimeException("Game hien khong hoat dong");
        }
        if (!Boolean.TRUE.equals(game.getVisible())) {
            throw new RuntimeException("Game hien khong hien thi");
        }
    }

    public void validatePlayRequest(MiniGame game, GamePlayRequest request) {
        validateGamePlayable(game);
        if (request == null) {
            throw new RuntimeException("Du lieu choi game khong hop le");
        }
        Map<String, Object> playData = request.playData();
        if ("MEMORY_MATCH".equalsIgnoreCase(game.getType())) {
            validateMemoryMatchPayload(request.score(), playData);
        } else if ("LUCKY_SPIN".equalsIgnoreCase(game.getType())) {
            validateLuckySpinPayload(request.score(), playData);
        }
    }

    private void validateMemoryMatchPayload(Integer score, Map<String, Object> playData) {
        if (score == null || score < 0) {
            throw new RuntimeException("Memory Match yeu cau score hop le");
        }
        if (playData == null || playData.isEmpty()) {
            throw new RuntimeException("Memory Match yeu cau playData");
        }
        boolean completed = asBoolean(playData.get("completed"));
        int matchedPairs = asInt(playData.get("matchedPairs"));
        int totalPairs = asInt(playData.get("totalPairs"));
        int attempts = asInt(playData.get("attempts"));
        int durationSeconds = asInt(playData.get("durationSeconds"));

        if (completed) {
            if (totalPairs <= 0 || matchedPairs != totalPairs) {
                throw new RuntimeException("Memory Match co du lieu cap the khong hop le");
            }
        } else {
            if (totalPairs <= 0 || matchedPairs > totalPairs) {
                throw new RuntimeException("Memory Match co du lieu cap the khong hop le");
            }
        }
        if (attempts < totalPairs || attempts > totalPairs * 6) {
            throw new RuntimeException("Memory Match co so lan lat the bat thuong");
        }
        if (durationSeconds < 1 || durationSeconds > 900) {
            throw new RuntimeException("Memory Match co thoi gian choi khong hop le");
        }
    }

    private void validateLuckySpinPayload(Integer score, Map<String, Object> playData) {
        if (playData == null || playData.isEmpty()) {
            throw new RuntimeException("Lucky Spin yeu cau playData");
        }
        if (score != null && score < 0) {
            throw new RuntimeException("Lucky Spin score khong hop le");
        }
        String spinToken = normalize(String.valueOf(playData.getOrDefault("spinToken", "")));
        int spinCount = asInt(playData.get("spinCount"));
        int durationSeconds = asInt(playData.get("durationSeconds"));
        if (spinToken.isBlank()) {
            throw new RuntimeException("Lucky Spin thieu spinToken hop le");
        }
        if (spinCount != 1) {
            throw new RuntimeException("Lucky Spin moi luot chi duoc spin 1 lan");
        }
        if (durationSeconds < 1 || durationSeconds > 120) {
            throw new RuntimeException("Lucky Spin co thoi gian quay khong hop le");
        }
    }

    private boolean asBoolean(Object value) {
        return value instanceof Boolean bool ? bool : Boolean.parseBoolean(String.valueOf(value));
    }

    private int asInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception exception) {
            return -1;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
