package com.rainbowforest.minigameservice.service.engine;

import java.util.Map;

public record GameExecutionResult(
        boolean rewardEligible,
        Integer normalizedScore,
        Map<String, Object> normalizedPlayData
) {
}
