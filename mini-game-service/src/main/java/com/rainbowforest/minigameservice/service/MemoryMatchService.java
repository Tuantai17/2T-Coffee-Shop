package com.rainbowforest.minigameservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.minigameservice.domain.GameLevel;
import com.rainbowforest.minigameservice.domain.GameSession;
import com.rainbowforest.minigameservice.repository.GameLevelRepository;
import com.rainbowforest.minigameservice.repository.GameSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class MemoryMatchService {

    @Autowired
    private GameLevelRepository levelRepository;

    @Autowired
    private GameSessionRepository sessionRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String LOCK_PREFIX = "minigame:lock:session:";

    public Map<String, Object> getGameStatus(Long userId) {
        LocalDateTime startOfDay = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).atStartOfDay();
        long playsToday = sessionRepository.countByUserIdAndStartedAtAfter(userId, startOfDay);
        
        long remainingPlays = Math.max(0, 1 - playsToday); // 1 free play per day
        
        Map<String, Object> status = new HashMap<>();
        status.put("remainingPlays", remainingPlays);
        return status;
    }

    public List<GameLevel> getLevels() {
        return levelRepository.findByActiveTrue();
    }

    @Transactional
    public Map<String, Object> createSession(Long userId, String levelCode) {
        LocalDateTime startOfDay = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).atStartOfDay();
        long playsToday = sessionRepository.countByUserIdAndStartedAtAfter(userId, startOfDay);
        if (playsToday >= 1) {
            throw new RuntimeException("Bạn đã hết lượt chơi hôm nay");
        }

        GameLevel level = levelRepository.findByCode(levelCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấp độ"));

        if (!level.getActive()) {
            throw new RuntimeException("Cấp độ này đang bị khóa");
        }

        int totalCards = level.getRows() * level.getCols();
        if (totalCards % 2 != 0) {
            throw new RuntimeException("Invalid level configuration: total cards must be even");
        }

        int pairs = totalCards / 2;
        List<Integer> deck = new ArrayList<>();
        for (int i = 1; i <= pairs; i++) {
            deck.add(i);
            deck.add(i);
        }

        Collections.shuffle(deck);

        String deckJson;
        try {
            deckJson = objectMapper.writeValueAsString(deck);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize deck");
        }

        GameSession session = GameSession.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .level(level)
                .deckLayout(deckJson)
                .status("PLAYING")
                .build();

        sessionRepository.save(session);

        // Return masked deck (all zeros or generic) for UI to render empty cards
        List<Integer> maskedDeck = new ArrayList<>(Collections.nCopies(totalCards, 0));
        
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("level", level);
        response.put("maskedDeck", maskedDeck);
        return response;
    }

    public Map<String, Object> getSession(Long userId, String sessionId) {
        GameSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("status", session.getStatus());
        response.put("level", session.getLevel());
        
        if (!"PLAYING".equals(session.getStatus())) {
            try {
                response.put("deck", objectMapper.readValue(session.getDeckLayout(), new TypeReference<List<Integer>>(){}));
            } catch (JsonProcessingException e) {
                // Ignore
            }
        }
        
        return response;
    }

    @Transactional
    public Map<String, Object> completeSession(Long userId, String sessionId, int moves, int timeTakenSeconds) {
        String lockKey = LOCK_PREFIX + sessionId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Đang xử lý session này");
        }

        try {
            GameSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            if (!session.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }

            if (!"PLAYING".equals(session.getStatus())) {
                throw new RuntimeException("Session đã kết thúc");
            }

            session.setMoves(moves);
            session.setTimeTakenSeconds(timeTakenSeconds);
            session.setCompletedAt(LocalDateTime.now());

            if (timeTakenSeconds > session.getLevel().getTimeLimitSeconds()) {
                session.setStatus("LOST");
            } else {
                session.setStatus("WON");
                session.setRewardType("POINTS");
                session.setRewardValue(String.valueOf(session.getLevel().getRewardPoints()));

                if (session.getLevel().getRewardVoucher() != null && !session.getLevel().getRewardVoucher().isEmpty()) {
                    session.setRewardType("VOUCHER");
                    session.setRewardValue(session.getLevel().getRewardVoucher());
                }

                // Publish Event to Loyalty Service
                Map<String, Object> eventPayload = new HashMap<>();
                eventPayload.put("userId", userId);
                eventPayload.put("sessionId", sessionId);
                eventPayload.put("gameName", "MEMORY_MATCH");
                eventPayload.put("rewardType", session.getRewardType());
                eventPayload.put("rewardValue", session.getRewardValue());

                Map<String, Object> event = new HashMap<>();
                event.put("eventId", UUID.randomUUID().toString());
                event.put("eventType", "MINIGAME_REWARD_GRANTED");
                event.put("payload", eventPayload);

                kafkaTemplate.send("loyalty-events", String.valueOf(userId), event);
            }

            sessionRepository.save(session);

            Map<String, Object> response = new HashMap<>();
            response.put("status", session.getStatus());
            response.put("rewardType", session.getRewardType());
            response.put("rewardValue", session.getRewardValue());
            
            try {
                response.put("deck", objectMapper.readValue(session.getDeckLayout(), new TypeReference<List<Integer>>(){}));
            } catch (Exception e) {}
            
            return response;

        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void abandonSession(Long userId, String sessionId) {
        GameSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("PLAYING".equals(session.getStatus())) {
            session.setStatus("ABANDONED");
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);
        }
    }
}
