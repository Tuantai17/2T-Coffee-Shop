package com.rainbowforest.loyaltyservice.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.domain.ProcessedEvent;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import com.rainbowforest.loyaltyservice.repository.ProcessedEventRepository;
import com.rainbowforest.loyaltyservice.service.VoucherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class GameEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(GameEventConsumer.class);

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "loyalty-events", groupId = "loyalty-game-group")
    @Transactional
    public void consumeGameEvent(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, new TypeReference<Map<String, Object>>(){});
            String eventId = (String) event.get("eventId");
            String eventType = (String) event.get("eventType");
            
            if (!"MINIGAME_REWARD_GRANTED".equals(eventType) && !"CHECKIN_REWARD_GRANTED".equals(eventType)) {
                return;
            }

            if (processedEventRepository.findByEventId(eventId).isPresent()) {
                log.info("Event {} already processed", eventId);
                return;
            }

            Map<String, Object> payload = (Map<String, Object>) event.get("payload");
            
            if ("MINIGAME_REWARD_GRANTED".equals(eventType)) {
                Long userId = Long.valueOf(payload.get("userId").toString());
                String sessionId = (String) payload.get("sessionId");
                String rewardType = (String) payload.get("rewardType");
                String rewardValue = (String) payload.get("rewardValue");

                if ("POINTS".equals(rewardType)) {
                    long points = Long.parseLong(rewardValue);
                    awardPoints(userId, points, "Thưởng Mini-Game", sessionId);
                } else if ("VOUCHER".equals(rewardType)) {
                    voucherService.claimVoucher(userId, rewardValue);
                }
            } else if ("CHECKIN_REWARD_GRANTED".equals(eventType)) {
                // Currently CheckinService awards points directly inside loyalty-service.
                // So we just log it or handle anything else we need. 
                // We won't award points here to avoid double awarding.
            }

            ProcessedEvent pe = ProcessedEvent.builder()
                    .eventId(eventId)
                    .eventType(eventType)
                    .referenceId(payload.get("sessionId") != null ? (String) payload.get("sessionId") : null)
                    .status("PROCESSED")
                    .build();
            processedEventRepository.save(pe);

        } catch (Exception e) {
            log.error("Error processing game event", e);
            throw new RuntimeException(e);
        }
    }

    private void awardPoints(Long userId, long points, String description, String refId) {
        LoyaltyAccount account = accountRepository.findByUserId(userId).orElseGet(() -> {
            return accountRepository.save(LoyaltyAccount.builder()
                    .userId(userId)
                    .availablePoints(0L)
                    .pendingPoints(0L)
                    .reservedPoints(0L)
                    .lifetimeEarnedPoints(0L)
                    .lifetimeUsedPoints(0L)
                    .currentTierCode("MEMBER")
                    .build());
        });

        account.setAvailablePoints(account.getAvailablePoints() + points);
        account.setLifetimeEarnedPoints(account.getLifetimeEarnedPoints() + points);
        accountRepository.save(account);

        PointTransaction tx = PointTransaction.builder()
                .transactionCode(UUID.randomUUID().toString())
                .userId(userId)
                .type("EARN")
                .source("MINIGAME")
                .points(points)
                .balanceBefore(account.getAvailablePoints() - points)
                .balanceAfter(account.getAvailablePoints())
                .referenceType("GAME_SESSION")
                .status("COMPLETED")
                .description(description)
                .build();
        transactionRepository.save(tx);
    }
}
