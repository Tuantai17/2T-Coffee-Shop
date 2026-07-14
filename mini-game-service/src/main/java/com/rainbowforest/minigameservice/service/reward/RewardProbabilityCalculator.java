package com.rainbowforest.minigameservice.service.reward;

import com.rainbowforest.minigameservice.domain.GameReward;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Component
public class RewardProbabilityCalculator {

    public BigDecimal sumProbability(List<GameReward> rewards) {
        return rewards.stream()
                .map(GameReward::getProbability)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
