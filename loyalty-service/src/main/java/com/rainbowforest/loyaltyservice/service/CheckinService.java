package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.DailyCheckin;
import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.repository.DailyCheckinRepository;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.Duration;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@Service
public class CheckinService {

    @Autowired
    private DailyCheckinRepository dailyCheckinRepository;

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String LOCK_PREFIX = "checkin:lock:user:";

    @Transactional
    public DailyCheckin processCheckin(Long userId) {
        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Xin đừng spam, hệ thống đang xử lý");
        }

        try {
            LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
            
            if (dailyCheckinRepository.findByUserIdAndCheckinDate(userId, today).isPresent()) {
                throw new RuntimeException("Bạn đã điểm danh hôm nay rồi");
            }

            DailyCheckin lastCheckin = dailyCheckinRepository.findFirstByUserIdOrderByCheckinDateDesc(userId).orElse(null);
            
            int newStreak = 1;
            if (lastCheckin != null) {
                if (lastCheckin.getCheckinDate().equals(today.minusDays(1))) {
                    newStreak = lastCheckin.getStreakCount() + 1;
                } else if (lastCheckin.getCheckinDate().equals(today)) {
                    // Fallback check
                    throw new RuntimeException("Bạn đã điểm danh hôm nay rồi");
                }
            }

            // Reset after 7 days
            if (newStreak > 7) {
                newStreak = 1;
            }

            String rewardType = "POINTS";
            String rewardValue = "";
            long pointsToReward = 0;

            switch (newStreak) {
                case 1: pointsToReward = 5; break;
                case 2: pointsToReward = 10; break;
                case 3: pointsToReward = 15; break;
                case 4: pointsToReward = 20; break;
                case 5: pointsToReward = 25; break;
                case 6: pointsToReward = 30; break;
                case 7: 
                    rewardType = "VOUCHER";
                    rewardValue = "FREE_TOPPING_7DAYS";
                    break;
            }

            if ("POINTS".equals(rewardType)) {
                rewardValue = String.valueOf(pointsToReward);
                awardPoints(userId, pointsToReward, "Điểm danh ngày " + newStreak);
            } else if ("VOUCHER".equals(rewardType)) {
                try {
                    voucherService.claimVoucher(userId, rewardValue);
                } catch (Exception e) {
                    // If voucher fails, fallback to points maybe? Let's just fail or ignore
                    throw new RuntimeException("Lỗi cấp voucher: " + e.getMessage());
                }
            }

            DailyCheckin checkin = DailyCheckin.builder()
                    .userId(userId)
                    .checkinDate(today)
                    .streakCount(newStreak)
                    .rewardType(rewardType)
                    .rewardValue(rewardValue)
                    .build();

            dailyCheckinRepository.save(checkin);

            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("userId", userId);
            eventPayload.put("checkinDate", today.toString());
            eventPayload.put("streakCount", newStreak);
            eventPayload.put("rewardType", rewardType);
            eventPayload.put("rewardValue", rewardValue);
            
            Map<String, Object> event = new HashMap<>();
            event.put("eventId", UUID.randomUUID().toString());
            event.put("eventType", "CHECKIN_REWARD_GRANTED");
            event.put("payload", eventPayload);

            kafkaTemplate.send("loyalty-events", String.valueOf(userId), event);

            return checkin;

        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    private void awardPoints(Long userId, long points, String description) {
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
                .source("CHECKIN")
                .points(points)
                .balanceBefore(account.getAvailablePoints() - points)
                .balanceAfter(account.getAvailablePoints())
                .referenceType("DAILY_CHECKIN")
                .status("COMPLETED")
                .description(description)
                .build();
        transactionRepository.save(tx);
    }
}
