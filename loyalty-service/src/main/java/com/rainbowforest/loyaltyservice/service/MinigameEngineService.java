package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.Random;

@Service
public class MinigameEngineService {

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "loyalty:lock:account:";
    private static final String SPIN_PREFIX = "loyalty:game:plays:";

    private final Random random = new Random();

    @Transactional
    public long spinLuckyWheel(Long userId) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String gameId = "LUCKY_WHEEL";
        String spinKey = SPIN_PREFIX + userId + ":" + gameId + ":" + today;

        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = accountRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            MembershipTier tier = tierRepository.findByCode(account.getCurrentTierCode())
                    .orElseThrow(() -> new RuntimeException("Tier not found"));

            int maxSpins = tier.getDailySpinCount();
            if (maxSpins <= 0) {
                throw new RuntimeException("Current tier does not support lucky wheel spins");
            }

            Long currentSpins = redisTemplate.opsForValue().increment(spinKey);
            if (currentSpins == 1) {
                redisTemplate.expire(spinKey, Duration.ofHours(24));
            }

            if (currentSpins != null && currentSpins > maxSpins) {
                // Giảm lại số spin đã lỡ cộng quá
                redisTemplate.opsForValue().decrement(spinKey);
                throw new RuntimeException("Daily spin limit reached");
            }

            // Logic random phần thưởng
            long rewardPoints = calculateRandomReward();
            if (rewardPoints > 0) {
                long oldBalance = account.getAvailablePoints();
                account.setAvailablePoints(account.getAvailablePoints() + rewardPoints);
                account.setLifetimeEarnedPoints(account.getLifetimeEarnedPoints() + rewardPoints);
                accountRepository.save(account);

                PointTransaction tx = PointTransaction.builder()
                        .transactionCode(UUID.randomUUID().toString())
                        .userId(userId)
                        .points(rewardPoints)
                        .balanceBefore(oldBalance)
                        .balanceAfter(account.getAvailablePoints())
                        .type("EARN")
                        .source("MINIGAME")
                        .referenceType("LUCKY_WHEEL")
                        .referenceId(today + "-" + currentSpins)
                        .status("COMPLETED")
                        .description("Trúng thưởng Lucky Wheel vòng " + currentSpins)
                        .build();
                transactionRepository.save(tx);
            }

            return rewardPoints;
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    private long calculateRandomReward() {
        int chance = random.nextInt(100);
        if (chance < 50) return 0; // 50% trượt
        if (chance < 80) return 100; // 30% 100 điểm
        if (chance < 95) return 500; // 15% 500 điểm
        return 1000; // 5% 1000 điểm
    }
}
