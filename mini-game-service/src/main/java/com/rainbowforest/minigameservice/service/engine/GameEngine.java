package com.rainbowforest.minigameservice.service.engine;

import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.dto.GamePlayRequest;

public interface GameEngine {

    boolean supports(String gameType);

    GameExecutionResult execute(MiniGame game, GamePlayRequest request);
}
