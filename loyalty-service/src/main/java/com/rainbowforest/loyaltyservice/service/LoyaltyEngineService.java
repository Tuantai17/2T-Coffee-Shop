package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.*;
import com.rainbowforest.loyaltyservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Service
public class LoyaltyEngineService {

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "loyalty:lock:account:";

    public long calculateEarnedPoints(long eligibleSpending) {
        if (eligibleSpending <= 0) return 0L;
        return eligibleSpending / 1000L;
    }

    @Transactional
    public void processOrderCompleted(Long userId, Long orderId, long productSubtotal, long productDiscount, long voucherDiscount, long pointsDiscount, long refundedProductAmount) {
        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            long eligibleSpending = productSubtotal - productDiscount - voucherDiscount - pointsDiscount - refundedProductAmount;
            long pointsToEarn = calculateEarnedPoints(eligibleSpending);

            if (pointsToEarn <= 0) return;

            LoyaltyAccount account = getOrCreateAccount(userId);

            account.setAvailablePoints(account.getAvailablePoints() + pointsToEarn);
            account.setLifetimeEarnedPoints(account.getLifetimeEarnedPoints() + pointsToEarn);
            
            evaluateTierUpgrade(account);
            accountRepository.save(account);

            PointTransaction transaction = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .type("EARN")
                    .source("ORDER")
                    .points(pointsToEarn)
                    .balanceBefore(account.getAvailablePoints() - pointsToEarn)
                    .balanceAfter(account.getAvailablePoints())
                    .referenceType("ORDER")
                    .referenceId(String.valueOf(orderId))
                    .status("COMPLETED")
                    .description("Cộng điểm từ đơn hàng #" + orderId)
                    .build();
            transactionRepository.save(transaction);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void addPointsFromCheckin(Long userId, long pointsToEarn, Long programId, String description) {
        if (pointsToEarn <= 0) return;
        
        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = getOrCreateAccount(userId);

            account.setAvailablePoints(account.getAvailablePoints() + pointsToEarn);
            account.setLifetimeEarnedPoints(account.getLifetimeEarnedPoints() + pointsToEarn);
            
            evaluateTierUpgrade(account);
            accountRepository.save(account);

            PointTransaction transaction = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .type("EARN")
                    .source("CHECKIN")
                    .points(pointsToEarn)
                    .balanceBefore(account.getAvailablePoints() - pointsToEarn)
                    .balanceAfter(account.getAvailablePoints())
                    .referenceType("CHECKIN_PROGRAM")
                    .referenceId(String.valueOf(programId))
                    .status("COMPLETED")
                    .description(description != null ? description : "Cộng điểm từ điểm danh hàng ngày")
                    .build();
            transactionRepository.save(transaction);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void subtractPointsFromCheckinRollback(Long userId, long pointsToRollback, Long historyId) {
        if (pointsToRollback <= 0) return;
        
        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
            if (account == null) return;

            long actualDeduction = Math.min(account.getAvailablePoints(), pointsToRollback);
            if (actualDeduction <= 0) return;

            account.setAvailablePoints(account.getAvailablePoints() - actualDeduction);
            account.setLifetimeEarnedPoints(Math.max(0, account.getLifetimeEarnedPoints() - actualDeduction));
            
            evaluateTierUpgrade(account);
            accountRepository.save(account);

            PointTransaction transaction = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .type("REVERSE")
                    .source("CHECKIN")
                    .points(actualDeduction)
                    .balanceBefore(account.getAvailablePoints() + actualDeduction)
                    .balanceAfter(account.getAvailablePoints())
                    .referenceType("CHECKIN_HISTORY")
                    .referenceId(String.valueOf(historyId))
                    .status("COMPLETED")
                    .description("Thu hồi điểm do Admin xóa lịch sử điểm danh")
                    .build();
            transactionRepository.save(transaction);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void processOrderCancelledOrRefunded(Long userId, Long orderId, long refundAmount) {
        String lockKey = LOCK_PREFIX + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
        if (Boolean.FALSE.equals(acquired)) {
            throw new RuntimeException("Could not acquire lock for user " + userId);
        }

        try {
            LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
            if (account == null) return;

            // Simple rollback logic for MVP: just deduct the points corresponding to the refund amount
            long pointsToRollback = calculateEarnedPoints(refundAmount);
            if (pointsToRollback <= 0) return;

            long actualDeduction = Math.min(account.getAvailablePoints(), pointsToRollback);

            account.setAvailablePoints(account.getAvailablePoints() - actualDeduction);
            // Optionally, we could adjust lifetime points, but usually refunds do affect lifetime points.
            account.setLifetimeEarnedPoints(Math.max(0, account.getLifetimeEarnedPoints() - actualDeduction));
            
            accountRepository.save(account);

            PointTransaction rollbackTx = PointTransaction.builder()
                    .transactionCode(UUID.randomUUID().toString())
                    .userId(userId)
                    .type("REVERSE")
                    .source("ORDER")
                    .points(actualDeduction)
                    .balanceBefore(account.getAvailablePoints() + actualDeduction)
                    .balanceAfter(account.getAvailablePoints())
                    .referenceType("ORDER_REFUND")
                    .referenceId(String.valueOf(orderId))
                    .status("COMPLETED")
                    .description("Thu hồi điểm do hoàn tiền đơn hàng #" + orderId)
                    .build();
            transactionRepository.save(rollbackTx);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    private LoyaltyAccount getOrCreateAccount(Long userId) {
        return accountRepository.findByUserId(userId).orElseGet(() -> {
            LoyaltyAccount newAccount = LoyaltyAccount.builder()
                    .userId(userId)
                    .availablePoints(0L)
                    .pendingPoints(0L)
                    .reservedPoints(0L)
                    .lifetimeEarnedPoints(0L)
                    .lifetimeUsedPoints(0L)
                    .currentTierCode("SILVER")
                    .build();
            return accountRepository.save(newAccount);
        });
    }

    @Autowired
    private MemberTierHistoryRepository tierHistoryRepository;

    private void evaluateTierUpgrade(LoyaltyAccount account) {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<PointTransaction> recentTransactions = transactionRepository.findOrderTransactionsSince(account.getUserId(), sixMonthsAgo);

        long totalEligiblePoints = 0;
        long totalReversedPoints = 0;
        long distinctOrders = recentTransactions.stream()
                .filter(t -> "EARN".equals(t.getType()))
                .map(PointTransaction::getReferenceId)
                .filter(ref -> ref != null && !ref.isEmpty())
                .distinct()
                .count();

        for (PointTransaction tx : recentTransactions) {
            if ("EARN".equals(tx.getType())) {
                totalEligiblePoints += tx.getPoints();
            } else if ("REVERSE".equals(tx.getType())) {
                totalReversedPoints += tx.getPoints();
            }
        }

        // Net eligible points multiplied by 1000 to get VND equivalent spending
        long netEligiblePoints = Math.max(0, totalEligiblePoints - totalReversedPoints);
        long eligibleSpending = netEligiblePoints * 1000L;

        MembershipTier currentTier = tierRepository.findByCode(account.getCurrentTierCode())
                .orElseThrow(() -> new RuntimeException("Current tier not found"));

        List<MembershipTier> allTiers = tierRepository.findAll();
        MembershipTier newTier = currentTier;

        for (MembershipTier tier : allTiers) {
            if (tier.getDisplayOrder() > newTier.getDisplayOrder()
                    && distinctOrders >= tier.getMinimumCompletedOrders()
                    && eligibleSpending >= tier.getMinimumEligibleSpending()) {
                newTier = tier;
            }
        }

        if (!newTier.getCode().equals(currentTier.getCode())) {
            account.setCurrentTierCode(newTier.getCode());
            
            MemberTierHistory history = MemberTierHistory.builder()
                    .userId(account.getUserId())
                    .oldTierCode(currentTier.getCode())
                    .newTierCode(newTier.getCode())
                    .completedOrders6Months((int) distinctOrders)
                    .eligibleSpending6Months(eligibleSpending)
                    .reason("Auto upgraded based on 6-month evaluation")
                    .build();
            tierHistoryRepository.save(history);

            // TODO: Emit TIER_UPGRADED event to Kafka for Voucher service
        }
    }
}
