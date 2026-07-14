package com.rainbowforest.loyaltyservice.controller;

import com.rainbowforest.loyaltyservice.domain.DailyCheckin;
import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.domain.UserVoucher;
import com.rainbowforest.loyaltyservice.domain.VoucherDefinition;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import com.rainbowforest.loyaltyservice.repository.UserVoucherRepository;
import com.rainbowforest.loyaltyservice.repository.VoucherDefinitionRepository;
import com.rainbowforest.loyaltyservice.service.LoyaltyEngineService;
import com.rainbowforest.loyaltyservice.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyUserController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private LoyaltyEngineService loyaltyEngineService;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    @Autowired
    private VoucherDefinitionRepository voucherDefinitionRepository;

    @Autowired
    private VoucherService voucherService;

    @GetMapping("/tiers")
    public ResponseEntity<?> getPublicTiers() {
        List<Map<String, Object>> tiers = tierRepository.findAll().stream()
                .filter(tier -> Boolean.TRUE.equals(tier.getActive()))
                .sorted(Comparator.comparingInt(tier -> tier.getDisplayOrder() != null ? tier.getDisplayOrder() : Integer.MAX_VALUE))
                .map(tier -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("code", tier.getCode());
                    map.put("name", tier.getName());
                    map.put("color", tier.getColor() != null && !tier.getColor().isBlank() ? tier.getColor() : "#cccccc");
                    map.put("icon", tier.getIcon() != null && !tier.getIcon().isBlank() ? tier.getIcon() : "fa-star");
                    map.put("displayOrder", tier.getDisplayOrder());
                    map.put("minimumEligibleSpending", tier.getMinimumEligibleSpending());
                    map.put("minimumCompletedOrders", tier.getMinimumCompletedOrders());
                    // Benefits
                    List<String> benefits = new java.util.ArrayList<>();
                    benefits.add("Điểm danh hàng ngày: " + safeLong(tier.getDailyCheckinPoints()) + " điểm");
                    benefits.add("Quay thưởng/ngày: " + (tier.getDailySpinCount() != null ? tier.getDailySpinCount() : 0) + " lượt");
                    if (safeLong(tier.getUpgradeVoucherValue()) > 0) {
                        benefits.add("Voucher lên hạng: " + String.format("%,dđ", safeLong(tier.getUpgradeVoucherValue())));
                    }
                    if (safeLong(tier.getBirthdayVoucherValue()) > 0) {
                        benefits.add("Voucher sinh nhật: " + String.format("%,dđ", safeLong(tier.getBirthdayVoucherValue())));
                    }
                    if (tier.getMonthlyFreeshipCount() != null && tier.getMonthlyFreeshipCount() > 0) {
                        benefits.add("Freeship/tháng: " + tier.getMonthlyFreeshipCount() + " lần");
                    }
                    if (Boolean.TRUE.equals(tier.getPrioritySupport())) {
                        benefits.add("Hỗ trợ ưu tiên");
                    }
                    map.put("benefits", benefits);
                    return map;
                })
                .toList();
        return ResponseEntity.ok(tiers);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyLoyaltyAccount(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        LoyaltyAccount account = accountRepository.findByUserId(userId)
                .orElse(LoyaltyAccount.builder()
                        .userId(userId)
                        .availablePoints(0L)
                        .pendingPoints(0L)
                        .reservedPoints(0L)
                        .lifetimeEarnedPoints(0L)
                        .lifetimeUsedPoints(0L)
                        .currentTierCode("SILVER")
                        .build());

        // Build enriched response with tier info
        List<MembershipTier> allTiers = tierRepository.findAll().stream()
                .filter(t -> Boolean.TRUE.equals(t.getActive()))
                .sorted(Comparator.comparingInt(t -> t.getDisplayOrder() != null ? t.getDisplayOrder() : Integer.MAX_VALUE))
                .toList();

        MembershipTier currentTier = allTiers.stream()
                .filter(t -> t.getCode().equalsIgnoreCase(account.getCurrentTierCode()))
                .findFirst().orElse(null);

        MembershipTier nextTier = allTiers.stream()
                .filter(t -> currentTier != null && t.getDisplayOrder() > currentTier.getDisplayOrder())
                .min(Comparator.comparingInt(t -> t.getDisplayOrder() != null ? t.getDisplayOrder() : Integer.MAX_VALUE))
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", account.getId());
        response.put("userId", account.getUserId());
        response.put("availablePoints", safeLong(account.getAvailablePoints()));
        response.put("pendingPoints", safeLong(account.getPendingPoints()));
        response.put("reservedPoints", safeLong(account.getReservedPoints()));
        response.put("lifetimeEarnedPoints", safeLong(account.getLifetimeEarnedPoints()));
        response.put("lifetimeUsedPoints", safeLong(account.getLifetimeUsedPoints()));
        response.put("currentTierCode", account.getCurrentTierCode());

        if (currentTier != null) {
            response.put("currentTierName", currentTier.getName());
            response.put("currentTierColor", currentTier.getColor());
            response.put("currentTierIcon", currentTier.getIcon());
            response.put("currentTierDisplayOrder", currentTier.getDisplayOrder());
        }

        if (nextTier != null) {
            response.put("nextTierCode", nextTier.getCode());
            response.put("nextTierName", nextTier.getName());
            response.put("nextTierColor", nextTier.getColor());
            response.put("nextTierMinSpending", nextTier.getMinimumEligibleSpending());
            response.put("nextTierMinOrders", nextTier.getMinimumCompletedOrders());
        }

        response.put("createdAt", account.getCreatedAt());
        response.put("updatedAt", account.getUpdatedAt());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<List<PointTransaction>> getMyTransactions(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(transactionRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/me/tier-progress")
    public ResponseEntity<?> getMyTierProgress(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }

        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<PointTransaction> recentTransactions = transactionRepository.findOrderTransactionsSince(account.getUserId(), sixMonthsAgo);

        long totalEligiblePoints = 0;
        long totalReversedPoints = 0;
        long distinctOrders = recentTransactions.stream()
                .filter(transaction -> "EARN".equals(transaction.getType()))
                .map(PointTransaction::getReferenceId)
                .filter(referenceId -> referenceId != null && !referenceId.isEmpty())
                .distinct()
                .count();

        for (PointTransaction transaction : recentTransactions) {
            if ("EARN".equals(transaction.getType())) {
                totalEligiblePoints += transaction.getPoints();
            } else if ("REVERSE".equals(transaction.getType())) {
                totalReversedPoints += transaction.getPoints();
            }
        }

        long eligibleSpending = Math.max(0, totalEligiblePoints - totalReversedPoints) * 1000L;

        Map<String, Object> progress = new LinkedHashMap<>();
        progress.put("currentTierCode", account.getCurrentTierCode());
        progress.put("completedOrders6Months", distinctOrders);
        progress.put("eligibleSpending6Months", eligibleSpending);

        var currentTier = tierRepository.findByCode(account.getCurrentTierCode()).orElse(null);
        var nextTier = tierRepository.findAll().stream()
                .filter(tier -> currentTier != null && tier.getDisplayOrder() > currentTier.getDisplayOrder())
                .min(Comparator.comparingInt(tier -> tier.getDisplayOrder() != null ? tier.getDisplayOrder() : Integer.MAX_VALUE))
                .orElse(null);

        if (nextTier != null) {
            progress.put("nextTierCode", nextTier.getCode());
            progress.put("ordersNeeded", Math.max(0, nextTier.getMinimumCompletedOrders() - distinctOrders));
            progress.put("spendingNeeded", Math.max(0L, nextTier.getMinimumEligibleSpending() - eligibleSpending));
        } else {
            progress.put("nextTierCode", null);
        }

        return ResponseEntity.ok(progress);
    }

    @GetMapping("/rewards")
    public ResponseEntity<?> getRewards(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean eligibleOnly) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        LoyaltyAccount account = accountRepository.findByUserId(userId)
                .orElse(LoyaltyAccount.builder().userId(userId).availablePoints(0L).currentTierCode("MEMBER").build());
        String normalizedSearch = search != null ? search.trim().toLowerCase() : "";
        String normalizedType = type != null ? type.trim().toUpperCase() : "";

        List<MembershipTier> allTiers = tierRepository.findAll();
        List<Map<String, Object>> rewards = voucherDefinitionRepository.findByActiveTrueOrderByUpdatedAtDesc().stream()
                .filter(voucher -> normalizedType.isBlank() || normalizedType.equals(voucher.getType()))
                .filter(voucher -> normalizedSearch.isBlank()
                        || voucher.getName().toLowerCase().contains(normalizedSearch)
                        || voucher.getCode().toLowerCase().contains(normalizedSearch))
                .map(voucher -> toRewardSummary(voucher, account, allTiers))
                .filter(summary -> !Boolean.TRUE.equals(eligibleOnly) || Boolean.TRUE.equals(summary.get("canRedeem")))
                .toList();

        return ResponseEntity.ok(rewards);
    }

    @PostMapping("/rewards/{rewardId}/preview")
    public ResponseEntity<?> previewReward(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long rewardId) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(voucherService.previewReward(userId, rewardId));
    }

    @PostMapping("/rewards/{rewardId}/redeem")
    public ResponseEntity<?> redeemReward(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long rewardId) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            VoucherDefinition definition = voucherDefinitionRepository.findById(rewardId).orElse(null);
            if (definition != null && definition.getRequiredTierCode() != null && !definition.getRequiredTierCode().isBlank() && !"ALL".equalsIgnoreCase(definition.getRequiredTierCode())) {
                LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
                String userTierCode = account != null ? account.getCurrentTierCode() : "MEMBER";
                
                MembershipTier userTier = tierRepository.findAll().stream()
                        .filter(t -> t.getCode().equalsIgnoreCase(userTierCode))
                        .findFirst().orElse(null);
                int userTierOrder = userTier != null ? userTier.getDisplayOrder() : 0;
                
                MembershipTier reqTier = tierRepository.findAll().stream()
                        .filter(t -> t.getCode().equalsIgnoreCase(definition.getRequiredTierCode()))
                        .findFirst().orElse(null);
                
                if (reqTier != null && userTierOrder < reqTier.getDisplayOrder()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Chưa đủ hạng thành viên để đổi voucher này. Yêu cầu hạng " + reqTier.getName()));
                }
            }

            UserVoucher redeemed = voucherService.redeemReward(userId, rewardId);
            return ResponseEntity.ok(toVoucherSummary(redeemed));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/me/vouchers")
    public ResponseEntity<?> getMyVouchers(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(required = false) String status) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        List<Map<String, Object>> vouchers = userVoucherRepository.findByUserIdOrderByAcquiredAtDesc(userId).stream()
                .map(this::toVoucherSummary)
                .filter(voucher -> status == null || status.isBlank() || status.equalsIgnoreCase((String) voucher.get("status")))
                .toList();
        return ResponseEntity.ok(vouchers);
    }

    @GetMapping("/me/vouchers/summary")
    public ResponseEntity<?> getMyVoucherSummary(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        List<Map<String, Object>> vouchers = userVoucherRepository.findByUserIdOrderByAcquiredAtDesc(userId).stream()
                .map(this::toVoucherSummary)
                .toList();

        long total = vouchers.size();
        long available = vouchers.stream().filter(voucher -> "AVAILABLE".equals(voucher.get("status"))).count();
        long expiringSoon = vouchers.stream().filter(voucher -> Boolean.TRUE.equals(voucher.get("expiringSoon"))).count();
        long used = vouchers.stream().filter(voucher -> "USED".equals(voucher.get("status"))).count();
        long expired = vouchers.stream().filter(voucher -> "EXPIRED".equals(voucher.get("status"))).count();
        long redeemed = vouchers.stream().filter(voucher -> "REDEEMED".equals(voucher.get("source"))).count();

        return ResponseEntity.ok(Map.of(
                "total", total,
                "available", available,
                "expiringSoon", expiringSoon,
                "used", used,
                "expired", expired,
                "redeemed", redeemed
        ));
    }

    @PostMapping("/vouchers/preview-checkout")
    public ResponseEntity<?> previewCheckoutVoucher(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody Map<String, Object> payload) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            userId = extractBodyLong(payload, "userId");
        }
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            String voucherCode = payload.get("voucherCode") instanceof String text ? text : "";
            Long orderTotal = extractBodyLong(payload, "orderTotal");
            return ResponseEntity.ok(voucherService.previewCheckoutVoucher(userId, voucherCode, orderTotal));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/vouchers/consume")
    public ResponseEntity<?> consumeVoucher(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody Map<String, Object> payload) {
        Long userId = extractUserId(userIdHeader);
        if (userId == null) {
            userId = extractBodyLong(payload, "userId");
        }
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            String voucherCode = payload.get("voucherCode") instanceof String text ? text : "";
            Long orderId = extractBodyLong(payload, "orderId");
            return ResponseEntity.ok(toVoucherSummary(voucherService.consumeVoucherByCode(userId, voucherCode, orderId)));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }



    private Map<String, Object> toRewardSummary(VoucherDefinition voucher, LoyaltyAccount account, List<MembershipTier> allTiers) {
        long requiredPoints = safeLong(voucher.getPointsRequired());
        long availablePoints = safeLong(account.getAvailablePoints());
        long remainingQuantity = voucher.getTotalQuantity() != null
                ? Math.max(0, voucher.getTotalQuantity() - (voucher.getClaimedQuantity() != null ? voucher.getClaimedQuantity() : 0))
                : Long.MAX_VALUE;

        MembershipTier userTier = allTiers.stream()
                .filter(t -> t.getCode().equalsIgnoreCase(account.getCurrentTierCode()))
                .findFirst().orElse(null);
        int userTierOrder = userTier != null ? userTier.getDisplayOrder() : 0;

        String requiredTierCode = voucher.getRequiredTierCode();
        boolean tierEligible = true;
        if (requiredTierCode != null && !requiredTierCode.isBlank() && !"ALL".equalsIgnoreCase(requiredTierCode)) {
            MembershipTier reqTier = allTiers.stream()
                    .filter(t -> t.getCode().equalsIgnoreCase(requiredTierCode))
                    .findFirst().orElse(null);
            if (reqTier != null && userTierOrder < reqTier.getDisplayOrder()) {
                tierEligible = false;
            }
        }

        Map<String, Object> reward = new LinkedHashMap<>();
        reward.put("id", voucher.getId());
        reward.put("code", voucher.getCode());
        reward.put("name", voucher.getName());
        reward.put("description", voucher.getDescription());
        reward.put("type", voucher.getType());
        reward.put("pointsRequired", requiredPoints);
        reward.put("discountLabel", buildDiscountLabel(voucher));
        reward.put("canRedeem", availablePoints >= requiredPoints && remainingQuantity > 0 && tierEligible);
        reward.put("tierEligible", tierEligible);
        reward.put("requiredTierCode", requiredTierCode);
        reward.put("remainingQuantity", remainingQuantity == Long.MAX_VALUE ? null : remainingQuantity);
        reward.put("claimedQuantity", voucher.getClaimedQuantity());
        reward.put("tag", buildRewardTag(voucher, remainingQuantity));
        reward.put("minOrderValue", safeLong(voucher.getMinOrderValue()));
        reward.put("validTo", voucher.getValidTo());
        return reward;
    }

    private Map<String, Object> toVoucherSummary(UserVoucher userVoucher) {
        VoucherDefinition definition = userVoucher.getVoucherDefinition();
        String status = deriveVoucherStatus(userVoucher);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", userVoucher.getId());
        summary.put("voucherDefinitionId", definition != null ? definition.getId() : null);
        summary.put("code", userVoucher.getCode());
        summary.put("definitionCode", definition != null ? definition.getCode() : null);
        summary.put("name", definition != null ? definition.getName() : userVoucher.getCode());
        summary.put("description", definition != null ? definition.getDescription() : null);
        summary.put("type", definition != null ? definition.getType() : null);
        summary.put("status", status);
        summary.put("source", definition != null && safeLong(definition.getPointsRequired()) > 0 ? "REDEEMED" : "ISSUED");
        summary.put("discountLabel", definition != null ? buildDiscountLabel(definition) : userVoucher.getCode());
        summary.put("minOrderValue", definition != null ? safeLong(definition.getMinOrderValue()) : 0L);
        summary.put("acquiredAt", formatDateTime(userVoucher.getAcquiredAt()));
        summary.put("usedAt", formatDateTime(userVoucher.getUsedAt()));
        summary.put("expiresAt", formatDateTime(userVoucher.getExpiresAt()));
        summary.put("expiringSoon", isExpiringSoon(userVoucher));
        summary.put("orderId", userVoucher.getOrderId());
        summary.put("canApply", "AVAILABLE".equals(status));
        return summary;
    }

    private String deriveVoucherStatus(UserVoucher userVoucher) {
        if ("USED".equalsIgnoreCase(userVoucher.getStatus())) {
            return "USED";
        }
        if (userVoucher.getExpiresAt() != null && userVoucher.getExpiresAt().isBefore(LocalDateTime.now())) {
            return "EXPIRED";
        }
        return "AVAILABLE";
    }

    private boolean isExpiringSoon(UserVoucher userVoucher) {
        return "AVAILABLE".equals(deriveVoucherStatus(userVoucher))
                && userVoucher.getExpiresAt() != null
                && userVoucher.getExpiresAt().isBefore(LocalDateTime.now().plusDays(3));
    }

    private String buildDiscountLabel(VoucherDefinition voucher) {
        String type = voucher.getType() != null ? voucher.getType().toUpperCase() : "";
        if ("FIXED_AMOUNT".equals(type) && voucher.getDiscountAmount() != null) {
            return "Giam " + formatCurrency(voucher.getDiscountAmount());
        }
        if ("PERCENTAGE".equals(type) && voucher.getDiscountPercentage() != null) {
            return "Giam " + voucher.getDiscountPercentage() + "%";
        }
        if ("FREE_SHIPPING".equals(type)) {
            return "Mien phi giao hang";
        }
        if ("FREE_ITEM".equals(type)) {
            return "Qua tang mien phi";
        }
        return voucher.getName();
    }

    private String buildRewardTag(VoucherDefinition voucher, long remainingQuantity) {
        if (remainingQuantity != Long.MAX_VALUE && remainingQuantity <= 10) {
            return "LIMITED";
        }
        if (voucher.getCreatedAt() != null && voucher.getCreatedAt().isAfter(LocalDateTime.now().minusDays(14))) {
            return "NEW";
        }
        if (voucher.getClaimedQuantity() != null && voucher.getClaimedQuantity() > 5) {
            return "HOT";
        }
        return null;
    }

    private String formatCurrency(long amount) {
        return String.format("%,dđ", amount);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }

    private Long extractUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return null;
        }
        return Long.parseLong(userIdHeader);
    }

    private Long extractBodyLong(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Long.parseLong(text);
        }
        return null;
    }

    private long safeLong(Long value) {
        return value != null ? value : 0L;
    }
}
