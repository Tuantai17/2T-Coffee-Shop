package com.rainbowforest.minigameservice.service;

import com.rainbowforest.minigameservice.domain.GameReward;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MiniGameEventPublisher {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishRewardGranted(Long userId, Long sessionId, String gameCode, GameReward reward) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", userId);
        payload.put("sessionId", String.valueOf(sessionId));
        payload.put("gameName", gameCode);
        boolean isPoint = "POINT".equalsIgnoreCase(reward.getRewardType()) || "POINTS".equalsIgnoreCase(reward.getRewardType());
        payload.put("rewardType", isPoint ? "POINTS" : "VOUCHER");
        payload.put("rewardValue", isPoint
                ? String.valueOf(reward.getPointValue() != null ? reward.getPointValue() : 0L)
                : reward.getVoucherId());

        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "MINIGAME_REWARD_GRANTED");
        event.put("payload", payload);

        kafkaTemplate.send("loyalty-events", String.valueOf(userId), event);
    }
}
