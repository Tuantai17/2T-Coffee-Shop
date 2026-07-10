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

@Service
public class CheckinEngineService {

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "loyalty:lock:account:";
    private static final String CHECKIN_PREFIX = "loyalty:checkin:";

    @Transactional
    public long processCheckin(Long userId) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String checkinKey = CHECKIN_PREFIX + userId + ":" + today;

        Boolean alreadyCheckedIn = redisTemplate.hasKey(checkinKey);
        if (Boolean.TRUE.equals(alreadyCheckedIn)) {
            throw new RuntimeException("User already checked in today");
        }

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

            long checkinPoints = tier.getDailyCheckinPoints();
            if (checkinPoints <= 0) {
                throw new RuntimeException("Current tier does not support daily checkin rewards");
            }

            long oldBalance = account.getAvailablePoints();
            account.setAvailablePoints(account.getAvailablePoints() + checkinPoints);
            // Lifetime earned points should increase for checkins? Yes, usually.
            account.setLifetimeEarnedPoints(account.getLifetimeEarnedPoints() + checkinPoints);
            accountRepository.save(account);

            redisTemplate.opsForValue().set(checkinKey, "CHECKED_IN", Duration.ofHours(24));

            PointTransaction tx = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .points(checkinPoints)
                    .balanceBefore(oldBalance)
                    .balanceAfter(account.getAvailablePoints())
                    .type("EARN")
                    .source("CHECKIN")
                    .referenceType("DAILY_CHECKIN")
                    .referenceId(today)
                    .status("COMPLETED")
                    .description("Điểm danh hằng ngày")
                    .build();
            transactionRepository.save(tx);

            return checkinPoints;
        } finally {
            redisTemplate.delete(lockKey);
        }
    }
}
