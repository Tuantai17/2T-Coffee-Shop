package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.domain.UserVoucher;
import com.rainbowforest.loyaltyservice.domain.VoucherDefinition;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import com.rainbowforest.loyaltyservice.repository.UserVoucherRepository;
import com.rainbowforest.loyaltyservice.repository.VoucherDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class VoucherService {

    @Autowired
    private VoucherDefinitionRepository voucherDefinitionRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyAccountRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Transactional
    public UserVoucher claimVoucher(Long userId, String voucherCode) {
        VoucherDefinition definition = voucherDefinitionRepository.findByActiveTrue().stream()
                .filter(voucher -> voucher.getCode().equalsIgnoreCase(voucherCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Voucher khong ton tai hoac da het han"));

        validateVoucherDefinition(definition);

        long userClaims = userVoucherRepository.findByUserId(userId).stream()
                .filter(userVoucher -> userVoucher.getVoucherDefinition().getId().equals(definition.getId()))
                .count();
        if (userClaims >= definition.getMaxClaimsPerUser()) {
            throw new RuntimeException("Ban da dat gioi han nhan voucher nay");
        }

        return issueVoucherToUser(userId, definition);
    }

    @Transactional
    public UserVoucher redeemReward(Long userId, Long voucherDefinitionId) {
        VoucherDefinition definition = voucherDefinitionRepository.findById(voucherDefinitionId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phan thuong"));

        validateVoucherDefinition(definition);

        long requiredPoints = safeLong(definition.getPointsRequired());

        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseGet(() -> loyaltyAccountRepository.save(LoyaltyAccount.builder()
                        .userId(userId)
                        .availablePoints(0L)
                        .pendingPoints(0L)
                        .reservedPoints(0L)
                        .lifetimeEarnedPoints(0L)
                        .lifetimeUsedPoints(0L)
                        .currentTierCode("MEMBER")
                        .build()));

        long currentPoints = safeLong(account.getAvailablePoints());
        if (currentPoints < requiredPoints) {
            throw new RuntimeException("Ban khong du diem de doi phan thuong nay");
        }

        account.setAvailablePoints(currentPoints - requiredPoints);
        account.setLifetimeUsedPoints(safeLong(account.getLifetimeUsedPoints()) + requiredPoints);
        loyaltyAccountRepository.save(account);

        pointTransactionRepository.save(PointTransaction.builder()
                .transactionCode(UUID.randomUUID().toString())
                .userId(userId)
                .type("SPEND")
                .source("REWARD_REDEEM")
                .points(-requiredPoints)
                .balanceBefore(currentPoints)
                .balanceAfter(account.getAvailablePoints())
                .referenceType("VOUCHER_REWARD")
                .referenceId(String.valueOf(definition.getId()))
                .status("COMPLETED")
                .description("Redeemed reward: " + definition.getName())
                .build());

        return issueVoucherToUser(userId, definition);
    }

    public Map<String, Object> previewReward(Long userId, Long voucherDefinitionId) {
        VoucherDefinition definition = voucherDefinitionRepository.findById(voucherDefinitionId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phan thuong"));
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElse(LoyaltyAccount.builder()
                        .userId(userId)
                        .availablePoints(0L)
                        .pendingPoints(0L)
                        .reservedPoints(0L)
                        .lifetimeEarnedPoints(0L)
                        .lifetimeUsedPoints(0L)
                        .currentTierCode("MEMBER")
                        .build());

        long requiredPoints = safeLong(definition.getPointsRequired());
        long currentPoints = safeLong(account.getAvailablePoints());

        Map<String, Object> preview = new LinkedHashMap<>();
        preview.put("rewardId", definition.getId());
        preview.put("rewardCode", definition.getCode());
        preview.put("rewardName", definition.getName());
        preview.put("rewardType", definition.getType());
        preview.put("requiredPoints", requiredPoints);
        preview.put("currentPoints", currentPoints);
        preview.put("remainingPoints", Math.max(0L, currentPoints - requiredPoints));
        preview.put("eligible", currentPoints >= requiredPoints);
        preview.put("description", definition.getDescription());
        preview.put("discountLabel", buildDiscountLabel(definition));
        preview.put("minOrderValue", safeLong(definition.getMinOrderValue()));
        preview.put("validTo", definition.getValidTo());
        return preview;
    }

    public Map<String, Object> previewCheckoutVoucher(Long userId, String voucherCode, Long orderTotal) {
        if (voucherCode == null || voucherCode.isBlank()) {
            throw new RuntimeException("Vui long chon voucher");
        }

        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndCodeIgnoreCase(userId, voucherCode.trim())
                .orElseThrow(() -> new RuntimeException("Voucher khong thuoc vi cua ban"));
        synchronizeVoucherStatus(userVoucher);

        if (!"AVAILABLE".equalsIgnoreCase(userVoucher.getStatus())) {
            throw new RuntimeException("Voucher khong con kha dung");
        }

        VoucherDefinition definition = userVoucher.getVoucherDefinition();
        long normalizedOrderTotal = orderTotal != null ? orderTotal : 0L;
        long discountAmount = calculateDiscountAmount(definition, normalizedOrderTotal);
        if (discountAmount <= 0L) {
            throw new RuntimeException("Voucher khong ap dung duoc cho don hang nay");
        }

        Map<String, Object> preview = new LinkedHashMap<>();
        preview.put("userVoucherId", userVoucher.getId());
        preview.put("voucherCode", userVoucher.getCode());
        preview.put("definitionCode", definition.getCode());
        preview.put("voucherName", definition.getName());
        preview.put("discountAmount", discountAmount);
        preview.put("discountLabel", buildDiscountLabel(definition));
        preview.put("minOrderValue", safeLong(definition.getMinOrderValue()));
        preview.put("orderTotal", normalizedOrderTotal);
        preview.put("remainingTotal", Math.max(0L, normalizedOrderTotal - discountAmount));
        preview.put("expiresAt", userVoucher.getExpiresAt());
        return preview;
    }

    @Transactional
    public UserVoucher consumeVoucherByCode(Long userId, String voucherCode, Long orderId) {
        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndCodeIgnoreCase(userId, voucherCode.trim())
                .orElseThrow(() -> new RuntimeException("Voucher khong ton tai trong vi cua ban"));
        return consumeVoucher(userId, userVoucher.getId(), orderId);
    }

    @Transactional
    public UserVoucher consumeVoucher(Long userId, Long userVoucherId, Long orderId) {
        UserVoucher userVoucher = userVoucherRepository.findById(userVoucherId)
                .orElseThrow(() -> new RuntimeException("Voucher khong ton tai"));

        if (!userVoucher.getUserId().equals(userId)) {
            throw new RuntimeException("Ban khong co quyen su dung voucher nay");
        }

        synchronizeVoucherStatus(userVoucher);
        if (!"AVAILABLE".equalsIgnoreCase(userVoucher.getStatus())) {
            throw new RuntimeException("Voucher khong kha dung");
        }

        userVoucher.setStatus("USED");
        userVoucher.setUsedAt(LocalDateTime.now());
        userVoucher.setOrderId(orderId);
        return userVoucherRepository.save(userVoucher);
    }

    private UserVoucher issueVoucherToUser(Long userId, VoucherDefinition definition) {
        definition.setClaimedQuantity((definition.getClaimedQuantity() != null ? definition.getClaimedQuantity() : 0) + 1);
        voucherDefinitionRepository.save(definition);

        UserVoucher userVoucher = UserVoucher.builder()
                .userId(userId)
                .voucherDefinition(definition)
                .code(definition.getCode() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status("AVAILABLE")
                .expiresAt(definition.getValidTo())
                .build();
        return userVoucherRepository.save(userVoucher);
    }

    private void validateVoucherDefinition(VoucherDefinition definition) {
        if (!Boolean.TRUE.equals(definition.getActive())) {
            throw new RuntimeException("Voucher dang tam ngung hoat dong");
        }
        if (definition.getValidFrom() != null && definition.getValidFrom().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Voucher chua den thoi gian su dung");
        }
        if (definition.getValidTo() != null && definition.getValidTo().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Voucher da het han");
        }
        if (definition.getTotalQuantity() != null
                && (definition.getClaimedQuantity() != null ? definition.getClaimedQuantity() : 0) >= definition.getTotalQuantity()) {
            throw new RuntimeException("Voucher da het luot su dung");
        }
    }

    private void synchronizeVoucherStatus(UserVoucher userVoucher) {
        if (userVoucher.getExpiresAt() != null
                && userVoucher.getExpiresAt().isBefore(LocalDateTime.now())
                && !"USED".equalsIgnoreCase(userVoucher.getStatus())
                && !"EXPIRED".equalsIgnoreCase(userVoucher.getStatus())) {
            userVoucher.setStatus("EXPIRED");
            userVoucherRepository.save(userVoucher);
        }
    }

    private long calculateDiscountAmount(VoucherDefinition definition, long orderTotal) {
        if (orderTotal < safeLong(definition.getMinOrderValue())) {
            return 0L;
        }

        String type = definition.getType() != null ? definition.getType().toUpperCase() : "";
        return switch (type) {
            case "FIXED_AMOUNT" -> Math.min(orderTotal, safeLong(definition.getDiscountAmount()));
            case "PERCENTAGE" -> {
                double percentage = definition.getDiscountPercentage() != null ? definition.getDiscountPercentage() : 0;
                long calculated = Math.round(orderTotal * (percentage / 100.0d));
                long maxDiscount = definition.getMaxDiscountAmount() != null ? definition.getMaxDiscountAmount() : calculated;
                yield Math.min(orderTotal, Math.min(calculated, maxDiscount));
            }
            case "FREE_SHIPPING" -> 30000L;
            default -> 0L;
        };
    }

    private String buildDiscountLabel(VoucherDefinition definition) {
        String type = definition.getType() != null ? definition.getType().toUpperCase() : "";
        if ("FIXED_AMOUNT".equals(type) && definition.getDiscountAmount() != null) {
            return "Giam " + formatCurrency(definition.getDiscountAmount());
        }
        if ("PERCENTAGE".equals(type) && definition.getDiscountPercentage() != null) {
            return "Giam " + definition.getDiscountPercentage() + "%";
        }
        if ("FREE_SHIPPING".equals(type)) {
            return "Mien phi giao hang";
        }
        if ("FREE_ITEM".equals(type)) {
            return "Qua tang mien phi";
        }
        return definition.getName();
    }

    private String formatCurrency(long amount) {
        return String.format("%,dđ", amount);
    }

    private long safeLong(Long value) {
        return value != null ? value : 0L;
    }
}
