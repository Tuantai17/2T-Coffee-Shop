package com.rainbowforest.minigameservice.service.engine;

import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.dto.GamePlayRequest;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class LuckySpinEngine implements GameEngine {

    @Override
    public boolean supports(String gameType) {
        return "LUCKY_SPIN".equalsIgnoreCase(gameType);
    }

    @Override
    public GameExecutionResult execute(MiniGame game, GamePlayRequest request) {
        Map<String, Object> source = request.playData();
        Map<String, Object> normalizedData = new LinkedHashMap<>();
        normalizedData.put("spinToken", trim(source.get("spinToken")));
        normalizedData.put("spinCount", asInt(source.get("spinCount")));
        normalizedData.put("durationSeconds", asInt(source.get("durationSeconds")));
        normalizedData.put("wheelVersion", trim(source.get("wheelVersion")));
        normalizedData.put("clientSeed", trim(source.get("clientSeed")));
        return new GameExecutionResult(true, request.score(), normalizedData);
    }

    private int asInt(Object value) {
        return value instanceof Number number ? number.intValue() : Integer.parseInt(String.valueOf(value));
    }

    private String trim(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }
}
