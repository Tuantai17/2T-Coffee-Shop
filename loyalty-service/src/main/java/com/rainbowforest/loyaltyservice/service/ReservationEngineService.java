package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

@Service
public class ReservationEngineService {

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "loyalty:lock:account:";
    private static final String RESERVATION_PREFIX = "loyalty:point-reservation:";

    // Tính toán số điểm tối đa có thể dùng
    public long previewPoints(Long userId, long orderTotal) {
        LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
        if (account == null) return 0;
        
        long availablePoints = account.getAvailablePoints();
        // Giả sử có chính sách tối đa dùng 50% giá trị đơn hàng, nhưng MVP V2 cho dùng hết nếu đủ điểm
        long maxPointsForOrder = orderTotal;
        return Math.min(availablePoints, maxPointsForOrder);
    }

    @Transactional
    public void reservePoints(Long userId, String orderId, long pointsToReserve) {
        if (pointsToReserve <= 0) return;

        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = accountRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            if (account.getAvailablePoints() < pointsToReserve) {
                throw new RuntimeException("Not enough available points to reserve");
            }

            // Trừ available, cộng vào reserved
            long oldBalance = account.getAvailablePoints();
            account.setAvailablePoints(account.getAvailablePoints() - pointsToReserve);
            account.setReservedPoints(account.getReservedPoints() + pointsToReserve);
            accountRepository.save(account);

            // Lưu reservation vào redis để tính timeout (15 phút)
            String reserveKey = RESERVATION_PREFIX + orderId;
            redisTemplate.opsForValue().set(reserveKey, String.valueOf(pointsToReserve), Duration.ofMinutes(15));

            PointTransaction tx = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .points(pointsToReserve)
                    .balanceBefore(oldBalance)
                    .balanceAfter(account.getAvailablePoints())
                    .type("RESERVE")
                    .source("ORDER")
                    .referenceType("ORDER_RESERVATION")
                    .referenceId(orderId)
                    .status("PENDING")
                    .description("Tạm giữ điểm cho đơn hàng #" + orderId)
                    .build();
            transactionRepository.save(tx);

        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void commitPoints(Long userId, String orderId) {
        String reserveKey = RESERVATION_PREFIX + orderId;
        String pointsStr = redisTemplate.opsForValue().get(reserveKey);
        if (pointsStr == null) {
            // Có thể đã timeout hoặc chưa reserve, bỏ qua hoặc báo lỗi
            return;
        }
        long pointsToCommit = Long.parseLong(pointsStr);

        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
            if (account == null) return;

            // Chuyển từ reserved sang used
            account.setReservedPoints(Math.max(0, account.getReservedPoints() - pointsToCommit));
            account.setLifetimeUsedPoints(account.getLifetimeUsedPoints() + pointsToCommit);
            accountRepository.save(account);

            PointTransaction tx = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .points(pointsToCommit)
                    .balanceBefore(account.getAvailablePoints())
                    .balanceAfter(account.getAvailablePoints())
                    .type("SPEND")
                    .source("ORDER")
                    .referenceType("ORDER_COMMIT")
                    .referenceId(orderId)
                    .status("COMPLETED")
                    .description("Sử dụng điểm cho đơn hàng #" + orderId)
                    .build();
            transactionRepository.save(tx);

            redisTemplate.delete(reserveKey);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void releasePoints(Long userId, String orderId) {
        String reserveKey = RESERVATION_PREFIX + orderId;
        String pointsStr = redisTemplate.opsForValue().get(reserveKey);
        if (pointsStr == null) {
            return;
        }
        long pointsToRelease = Long.parseLong(pointsStr);

        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
            if (account == null) return;

            long oldBalance = account.getAvailablePoints();
            account.setReservedPoints(Math.max(0, account.getReservedPoints() - pointsToRelease));
            account.setAvailablePoints(account.getAvailablePoints() + pointsToRelease);
            accountRepository.save(account);

            PointTransaction tx = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .points(pointsToRelease)
                    .balanceBefore(oldBalance)
                    .balanceAfter(account.getAvailablePoints())
                    .type("RELEASE")
                    .source("ORDER")
                    .referenceType("ORDER_RELEASE")
                    .referenceId(orderId)
                    .status("COMPLETED")
                    .description("Hoàn lại điểm tạm giữ từ đơn hàng #" + orderId)
                    .build();
            transactionRepository.save(tx);

            redisTemplate.delete(reserveKey);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }
}
