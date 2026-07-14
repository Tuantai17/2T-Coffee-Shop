package com.rainbowforest.minigameservice.service.engine;

import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.dto.GamePlayRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class MemoryMatchEngine implements GameEngine {

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean supports(String gameType) {
        return "MEMORY_MATCH".equalsIgnoreCase(gameType);
    }

    @Override
    public GameExecutionResult execute(MiniGame game, GamePlayRequest request) {
        Map<String, Object> source = request.playData();
        Map<String, Object> normalizedData = new LinkedHashMap<>();
        normalizedData.put("completed", asBoolean(source.get("completed")));
        normalizedData.put("matchedPairs", asInt(source.get("matchedPairs")));
        normalizedData.put("totalPairs", asInt(source.get("totalPairs")));
        normalizedData.put("attempts", asInt(source.get("attempts")));
        normalizedData.put("durationSeconds", asInt(source.get("durationSeconds")));
        normalizedData.put("clientSeed", trim(source.get("clientSeed")));
        normalizedData.put("boardVersion", trim(source.get("boardVersion")));

        int calculatedScore = request.score();
        if (game.getGameplayConfig() != null) {
            try {
                Map<String, Object> config = objectMapper.readValue(game.getGameplayConfig(), new TypeReference<Map<String, Object>>() {});
                int matchPoints = config.containsKey("matchPoints") ? asInt(config.get("matchPoints")) : 100;
                int missPoints = config.containsKey("missPoints") ? asInt(config.get("missPoints")) : -5;
                int matchedPairs = asInt(source.get("matchedPairs"));
                int attempts = asInt(source.get("attempts"));
                int missedPairs = Math.max(0, attempts - matchedPairs);
                
                calculatedScore = (matchedPairs * matchPoints) + (missedPairs * missPoints);
                calculatedScore = Math.max(0, calculatedScore); // Don't allow negative scores
            } catch (Exception e) {
                // fallback to request score
            }
        }

        return new GameExecutionResult(asBoolean(source.get("completed")), calculatedScore, normalizedData);
    }

    private boolean asBoolean(Object value) {
        return value instanceof Boolean bool ? bool : Boolean.parseBoolean(String.valueOf(value));
    }

    private int asInt(Object value) {
        return value instanceof Number number ? number.intValue() : Integer.parseInt(String.valueOf(value));
    }

    private String trim(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }
}
