package com.rainbowforest.minigameservice.service.engine;

import com.rainbowforest.minigameservice.domain.MiniGame;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GameEngineRegistry {

    @Autowired
    private List<GameEngine> gameEngines;

    public GameEngine getEngine(MiniGame game) {
        return gameEngines.stream()
                .filter(engine -> engine.supports(game.getType()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chua cau hinh engine cho game type " + game.getType()));
    }
}
