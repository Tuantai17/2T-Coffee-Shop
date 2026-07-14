package com.rainbowforest.minigameservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.minigameservice.domain.GameActivityLog;
import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.repository.GameActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class GameActivityLogService {

    @Autowired
    private GameActivityLogRepository gameActivityLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public void log(MiniGame game, Long actorId, String actionType, String actionDetail, Map<String, Object> metadata) {
        GameActivityLog log = GameActivityLog.builder()
                .game(game)
                .actorId(actorId)
                .actionType(actionType)
                .actionDetail(actionDetail)
                .metadataJson(toJson(metadata))
                .build();
        gameActivityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getByGameId(Long gameId) {
        return gameActivityLogRepository.findByGame_IdOrderByCreatedAtDesc(gameId).stream()
                .map(this::toRow)
                .toList();
    }

    private Map<String, Object> toRow(GameActivityLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("gameId", log.getGame().getId());
        row.put("gameName", log.getGame().getName());
        row.put("actorId", log.getActorId());
        row.put("actionType", log.getActionType());
        row.put("actionDetail", log.getActionDetail());
        row.put("metadataJson", log.getMetadataJson());
        row.put("createdAt", log.getCreatedAt());
        return row;
    }

    private String toJson(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException exception) {
            throw new RuntimeException("Khong the luu activity log");
        }
    }
}
