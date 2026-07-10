package com.rainbowforest.loyaltyservice.scheduler;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Component
public class BirthdayEngineScheduler {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    // Run at 00:01 every day
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void processBirthdayRewards() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String lockKey = "loyalty:lock:birthday:" + today;

        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofHours(24));
        if (Boolean.FALSE.equals(acquired)) {
            // Another instance is already processing birthday rewards for today
            return;
        }

        try {
            // TODO: In a real microservice environment, make a Feign client call to user-service
            // to fetch all user IDs whose birthday is today.
            // For now, we stub it as an empty list to compile.
            List<Long> usersWithBirthdayToday = fetchUsersWithBirthdayToday();

            for (Long userId : usersWithBirthdayToday) {
                LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
                if (account == null) continue;

                MembershipTier tier = tierRepository.findByCode(account.getCurrentTierCode()).orElse(null);
                if (tier == null) continue;

                long birthdayVoucherValue = tier.getBirthdayVoucherValue();
                if (birthdayVoucherValue > 0) {
                    // Cấp voucher hoặc điểm
                    // MVP: Ta cộng thẳng điểm tương đương vào tài khoản hoặc phát hành voucher qua Event.
                    // Ở đây mô phỏng việc cộng điểm (hoặc có thể bắn Kafka Event BIRTHDAY_REWARD_CREATED)
                    
                    account.setAvailablePoints(account.getAvailablePoints() + birthdayVoucherValue);
                    accountRepository.save(account);

                    PointTransaction tx = PointTransaction.builder()
                            .transactionCode(UUID.randomUUID().toString())
                            .userId(userId)
                            .points(birthdayVoucherValue)
                            .balanceBefore(account.getAvailablePoints() - birthdayVoucherValue)
                            .balanceAfter(account.getAvailablePoints())
                            .type("EARN")
                            .source("BIRTHDAY")
                            .referenceType("SYSTEM_REWARD")
                            .referenceId(today)
                            .status("COMPLETED")
                            .description("Quà tặng sinh nhật thành viên " + tier.getName())
                            .build();
                    transactionRepository.save(tx);
                }
            }

        } catch (Exception e) {
            // If it fails completely, we might want to delete the lock to retry, or handle it properly.
            redisTemplate.delete(lockKey);
            throw e;
        }
    }

    private List<Long> fetchUsersWithBirthdayToday() {
        // Stub
        return List.of();
    }
}
