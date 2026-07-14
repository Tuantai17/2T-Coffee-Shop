package com.rainbowforest.minigameservice.service.reward;

import com.rainbowforest.minigameservice.domain.GameReward;

public interface RewardEngine {

    GameReward selectReward(Long gameId);
}
