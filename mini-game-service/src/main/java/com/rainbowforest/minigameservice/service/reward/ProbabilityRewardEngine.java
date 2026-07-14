package com.rainbowforest.minigameservice.service.reward;

import com.rainbowforest.minigameservice.domain.GameReward;
import com.rainbowforest.minigameservice.repository.GameRewardRepository;
import com.rainbowforest.minigameservice.service.MiniGameValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
public class ProbabilityRewardEngine implements RewardEngine {

    @Autowired
    private GameRewardRepository gameRewardRepository;

    @Autowired
    private RewardProbabilityCalculator rewardProbabilityCalculator;

    @Autowired
    private RandomRollProvider randomRollProvider;

    @Override
    public GameReward selectReward(Long gameId) {
        List<GameReward> activeRewards = gameRewardRepository
                .findByGame_IdAndStatusIgnoreCaseOrderByCreatedAtDesc(gameId, MiniGameValidationService.ACTIVE_STATUS)
                .stream()
                .filter(reward -> reward.getRemainingQuantity() == null || reward.getRemainingQuantity() > 0)
                .toList();

        if (activeRewards.isEmpty()) {
            return null;
        }

        BigDecimal totalProbability = rewardProbabilityCalculator.sumProbability(activeRewards);
        double rolled = randomRollProvider.nextDouble(0.0, 100.0);
        if (rolled >= totalProbability.doubleValue()) {
            return null;
        }

        double cumulative = 0.0;
        for (GameReward reward : activeRewards) {
            cumulative += reward.getProbability() != null ? reward.getProbability().doubleValue() : 0.0;
            if (rolled < cumulative) {
                return reward;
            }
        }
        return null;
    }
}
