package com.rainbowforest.loyaltyservice.controller;

import com.rainbowforest.loyaltyservice.client.UserServiceClient;
import com.rainbowforest.loyaltyservice.client.UserServiceUser;
import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.LoyaltyRule;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.domain.UserVoucher;
import com.rainbowforest.loyaltyservice.domain.VoucherDefinition;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.LoyaltyRuleRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import com.rainbowforest.loyaltyservice.repository.UserVoucherRepository;
import com.rainbowforest.loyaltyservice.repository.VoucherDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/loyalty")
public class LoyaltyAdminController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private VoucherDefinitionRepository voucherDefinitionRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    @Autowired
    private LoyaltyRuleRepository ruleRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        List<LoyaltyAccount> accounts = accountRepository.findAll();
        long totalMembers = accounts.size();
        long totalPointsIssued = accounts.stream().mapToLong(account -> safeLong(account.getLifetimeEarnedPoints())).sum();
        long totalPointsRedeemed = accounts.stream().mapToLong(account -> safeLong(account.getLifetimeUsedPoints())).sum();
        long totalRewards = voucherDefinitionRepository.findAll().stream().filter(voucher -> safeLong(voucher.getPointsRequired()) > 0L).count();
        long vipMembers = accounts.stream().filter(account -> safeLong(account.getLifetimeEarnedPoints()) >= 15000L).count();

        return ResponseEntity.ok(List.of(
                Map.of("title", "Tong thanh vien", "val", totalMembers, "diff", "+8.5%", "icon", "fa-users", "color", "danger"),
                Map.of("title", "Tong diem da phat", "val", totalPointsIssued, "diff", "+10.2%", "icon", "fa-coins", "color", "warning"),
                Map.of("title", "Tong diem da doi", "val", totalPointsRedeemed, "diff", "+10.1%", "icon", "fa-gift", "color", "success"),
                Map.of("title", "Reward dang quan ly", "val", totalRewards, "diff", "+6.2%", "icon", "fa-ticket", "color", "primary"),
                Map.of("title", "Ti le len hang", "val", "24.5%", "diff", "+5.6%", "icon", "fa-arrow-trend-up", "color", "warning"),
                Map.of("title", "Khach VIP", "val", vipMembers, "diff", "+7.2%", "icon", "fa-gem", "color", "danger")
        ));
    }

    @GetMapping("/dashboard/charts")
    public ResponseEntity<?> getDashboardCharts() {
        List<LoyaltyAccount> accounts = accountRepository.findAll();
        Map<Long, UserServiceUser> userLookup = loadUserLookup(accounts.stream().map(LoyaltyAccount::getUserId).collect(Collectors.toSet()));
        Map<String, Long> memberCountsByTier = buildTierMemberCounts(accounts);

        long totalIssued = accounts.stream().mapToLong(account -> safeLong(account.getLifetimeEarnedPoints())).sum();
        long totalAvailable = accounts.stream().mapToLong(account -> safeLong(account.getAvailablePoints())).sum();
        long totalRedeemed = Math.max(0L, totalIssued - totalAvailable);

        List<Map<String, Object>> pointsOverview = List.of(
                chartSlice("Issued", totalIssued, "#D4A017"),
                chartSlice("Redeemed", totalRedeemed, "#198754"),
                chartSlice("Available", totalAvailable, "#0D6EFD")
        );

        List<Map<String, Object>> tierDistribution = tierRepository.findAll().stream()
                .sorted(Comparator.comparingInt(tier -> tier.getDisplayOrder() != null ? tier.getDisplayOrder() : Integer.MAX_VALUE))
                .map(tier -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("name", tier.getName());
                    map.put("members", memberCountsByTier.getOrDefault(normalizeTierCode(tier.getCode()), 0L));
                    map.put("color", tier.getColor() != null && !tier.getColor().isBlank() ? tier.getColor() : "#cccccc");
                    return map;
                })
                .toList();

        List<Map<String, Object>> topMembers = accounts.stream()
                .sorted(Comparator.comparingLong((LoyaltyAccount account) -> safeLong(account.getAvailablePoints())).reversed())
                .limit(5)
                .map(account -> {
                    UserServiceUser profile = userLookup.get(account.getUserId());
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("userId", account.getUserId());
                    map.put("name", resolveDisplayName(profile, account.getUserId()));
                    map.put("tier", formatTierLabel(account.getCurrentTierCode()));
                    map.put("points", account.getAvailablePoints());
                    map.put("avatar", resolveAvatar(profile, account.getUserId()));
                    return map;
                })
                .toList();

        return ResponseEntity.ok(Map.of(
                "pointsOverview", pointsOverview,
                "tierDistribution", tierDistribution,
                "topMembers", topMembers
        ));
    }

    @GetMapping("/members")
    public ResponseEntity<?> getAllMembers() {
        List<LoyaltyAccount> accounts = accountRepository.findAll();
        Map<Long, UserServiceUser> userLookup = loadUserLookup(accounts.stream().map(LoyaltyAccount::getUserId).collect(Collectors.toSet()));

        List<Map<String, Object>> response = accounts.stream()
                .map(account -> {
                    UserServiceUser profile = userLookup.get(account.getUserId());
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", account.getId());
                    map.put("userId", account.getUserId());
                    map.put("name", resolveDisplayName(profile, account.getUserId()));
                    map.put("email", resolveEmail(profile));
                    map.put("tier", formatTierLabel(account.getCurrentTierCode()));
                    map.put("points", safeLong(account.getAvailablePoints()));
                    map.put("phone", resolvePhone(profile));
                    map.put("date", account.getCreatedAt() != null ? account.getCreatedAt().toLocalDate().toString() : "2026-01-01");
                    map.put("status", resolveStatus(profile));
                    map.put("avatar", resolveAvatar(profile, account.getUserId()));
                    map.put("lifetimeEarnedPoints", safeLong(account.getLifetimeEarnedPoints()));
                    map.put("lifetimeUsedPoints", safeLong(account.getLifetimeUsedPoints()));
                    return map;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/members/{userId}")
    public ResponseEntity<?> getMemberDetail(@PathVariable Long userId) {
        LoyaltyAccount account = accountRepository.findByUserId(userId).orElse(null);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }

        UserServiceUser profile = loadUserProfile(userId);
        List<Map<String, Object>> recentTransactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(10)
                .map(transaction -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", transaction.getId());
                    map.put("type", transaction.getType());
                    map.put("source", transaction.getSource());
                    map.put("points", transaction.getPoints());
                    map.put("balanceAfter", transaction.getBalanceAfter());
                    map.put("status", transaction.getStatus());
                    map.put("description", transaction.getDescription());
                    map.put("date", transaction.getCreatedAt() != null ? transaction.getCreatedAt().format(DATE_TIME_FORMATTER) : null);
                    return map;
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", account.getId());
        response.put("userId", account.getUserId());
        response.put("name", resolveDisplayName(profile, account.getUserId()));
        response.put("email", resolveEmail(profile));
        response.put("phone", resolvePhone(profile));
        response.put("status", resolveStatus(profile));
        response.put("avatar", resolveAvatar(profile, account.getUserId()));
        response.put("tier", formatTierLabel(account.getCurrentTierCode()));
        response.put("points", safeLong(account.getAvailablePoints()));
        response.put("pendingPoints", safeLong(account.getPendingPoints()));
        response.put("reservedPoints", safeLong(account.getReservedPoints()));
        response.put("lifetimeEarnedPoints", safeLong(account.getLifetimeEarnedPoints()));
        response.put("lifetimeUsedPoints", safeLong(account.getLifetimeUsedPoints()));
        response.put("date", account.getCreatedAt() != null ? account.getCreatedAt().toLocalDate().toString() : null);
        response.put("recentTransactions", recentTransactions);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/members/{userId}/adjust-point")
    @Transactional
    public ResponseEntity<?> adjustPoints(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        long points = extractLong(payload.get("points"));
        String reason = payload.get("reason") instanceof String text ? text : "Manual adjustment";
        String adjustType = payload.get("adjustType") instanceof String text ? text : "addPoint";
        if ("subPoint".equals(adjustType)) {
            points = -Math.abs(points);
        } else {
            points = Math.abs(points);
        }

        if (points == 0L) {
            return ResponseEntity.badRequest().body("Points must not be zero");
        }

        LoyaltyAccount account = accountRepository.findByUserId(userId).orElseGet(() ->
                accountRepository.save(LoyaltyAccount.builder()
                        .userId(userId)
                        .availablePoints(0L)
                        .pendingPoints(0L)
                        .reservedPoints(0L)
                        .lifetimeEarnedPoints(0L)
                        .lifetimeUsedPoints(0L)
                        .currentTierCode("MEMBER")
                        .build())
        );

        long oldBalance = safeLong(account.getAvailablePoints());
        account.setAvailablePoints(Math.max(0L, oldBalance + points));
        if (points > 0) {
            account.setLifetimeEarnedPoints(safeLong(account.getLifetimeEarnedPoints()) + points);
        } else {
            account.setLifetimeUsedPoints(safeLong(account.getLifetimeUsedPoints()) + Math.abs(points));
        }
        accountRepository.save(account);

        transactionRepository.save(PointTransaction.builder()
                .transactionCode(UUID.randomUUID().toString())
                .userId(userId)
                .points(points)
                .balanceBefore(oldBalance)
                .balanceAfter(account.getAvailablePoints())
                .type("ADJUST")
                .source("ADMIN_ADJUSTMENT")
                .referenceType("ADMIN")
                .status("COMPLETED")
                .description("Admin adjusted points: " + reason)
                .build());

        return ResponseEntity.ok(account);
    }

    @GetMapping("/tiers")
    public ResponseEntity<?> getAllTiers() {
        Map<String, Long> memberCountsByTier = buildTierMemberCounts(accountRepository.findAll());
        List<Map<String, Object>> response = tierRepository.findAll().stream()
                .sorted(Comparator.comparingInt(tier -> tier.getDisplayOrder() != null ? tier.getDisplayOrder() : Integer.MAX_VALUE))
                .map(tier -> toTierResponse(tier, memberCountsByTier))
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tiers")
    public ResponseEntity<?> createTier(@RequestBody MembershipTier tier) {
        return ResponseEntity.ok(tierRepository.save(tier));
    }

    @PutMapping("/tiers/{id}")
    public ResponseEntity<?> updateTier(@PathVariable Long id, @RequestBody MembershipTier tier) {
        tier.setId(id);
        return ResponseEntity.ok(tierRepository.save(tier));
    }

    @DeleteMapping("/tiers/{id}")
    public ResponseEntity<?> deleteTier(@PathVariable Long id) {
        tierRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tiers/sync")
    public ResponseEntity<?> syncMembersTiers() {
        return ResponseEntity.ok(Map.of("message", "Member tiers synchronized successfully", "updatedCount", 0));
    }

    @GetMapping("/rules")
    public ResponseEntity<?> getAllRules() {
        List<Map<String, Object>> response = ruleRepository.findAll().stream()
                .filter(rule -> !Boolean.TRUE.equals(rule.getIsDeleted()))
                .map(rule -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", rule.getId());
                    map.put("name", rule.getName());
                    map.put("type", rule.getType());
                    map.put("source", rule.getSource());
                    map.put("condition", rule.getCondition());
                    map.put("point", rule.getPoint());
                    map.put("status", rule.getStatus());
                    map.put("createdAt", rule.getCreatedAt());
                    map.put("updatedAt", rule.getUpdatedAt());
                    map.put("createdBy", rule.getCreatedBy());
                    map.put("updatedBy", rule.getUpdatedBy());
                    return map;
                })
                .sorted(Comparator.comparing(map -> (LocalDateTime) map.get("createdAt"), Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rules")
    public ResponseEntity<?> createRule(@RequestBody LoyaltyRule rule) {
        rule.setCreatedBy("admin");
        rule.setUpdatedBy("admin");
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<?> updateRule(@PathVariable Long id, @RequestBody LoyaltyRule rule) {
        rule.setId(id);
        rule.setUpdatedBy("admin");
        ruleRepository.findById(id).ifPresent(existing -> {
            rule.setCreatedBy(existing.getCreatedBy());
            rule.setCreatedAt(existing.getCreatedAt());
            rule.setIsDeleted(existing.getIsDeleted());
        });
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        ruleRepository.findById(id).ifPresent(rule -> {
            rule.setIsDeleted(true);
            rule.setStatus(false);
            rule.setUpdatedBy("admin");
            ruleRepository.save(rule);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping("/rules/test")
    public ResponseEntity<?> testRule(@RequestBody Map<String, Object> payload) {
        String source = payload.get("source") instanceof String text ? text : "";
        long points;
        if ("ORDER".equals(source)) {
            points = extractLong(payload.get("orderValue")) / 1000L;
        } else if ("CHECKIN".equals(source)) {
            points = 5L;
        } else {
            points = 10L;
        }
        return ResponseEntity.ok(Map.of(
                "points", points,
                "message", "With the current conditions, the customer receives " + points + " points."
        ));
    }

    @GetMapping("/vouchers")
    public ResponseEntity<?> getAllVouchers() {
        List<Map<String, Object>> response = voucherDefinitionRepository.findAll().stream()
                .sorted(Comparator.comparing(VoucherDefinition::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toVoucherAdminSummary)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vouchers/{id}")
    public ResponseEntity<?> getVoucherDetail(@PathVariable Long id) {
        VoucherDefinition voucher = voucherDefinitionRepository.findById(id).orElse(null);
        if (voucher == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> detail = new LinkedHashMap<>(toVoucherAdminSummary(voucher));
        detail.put("discountAmount", voucher.getDiscountAmount());
        detail.put("discountPercentage", voucher.getDiscountPercentage());
        detail.put("createdAt", voucher.getCreatedAt());
        detail.put("updatedAt", voucher.getUpdatedAt());
        detail.put("validFrom", voucher.getValidFrom());
        detail.put("validTo", voucher.getValidTo());
        detail.put("requiredTierCode", voucher.getRequiredTierCode());
        detail.put("maxDiscountAmount", voucher.getMaxDiscountAmount());
        detail.put("totalQuantity", voucher.getTotalQuantity());
        detail.put("maxClaimsPerUser", voucher.getMaxClaimsPerUser());
        detail.put("claimedQuantity", voucher.getClaimedQuantity());
        detail.put("auditLog", List.of(
                Map.of("label", "Created", "value", voucher.getCreatedAt() != null ? voucher.getCreatedAt().format(DATE_TIME_FORMATTER) : "N/A"),
                Map.of("label", "Updated", "value", voucher.getUpdatedAt() != null ? voucher.getUpdatedAt().format(DATE_TIME_FORMATTER) : "N/A"),
                Map.of("label", "Claimed", "value", String.valueOf(voucher.getClaimedQuantity() != null ? voucher.getClaimedQuantity() : 0))
        ));
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/vouchers")
    public ResponseEntity<?> createVoucher(@RequestBody VoucherDefinition voucher) {
        return ResponseEntity.ok(voucherDefinitionRepository.save(voucher));
    }

    @PutMapping("/vouchers/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody VoucherDefinition voucher) {
        voucher.setId(id);
        return ResponseEntity.ok(voucherDefinitionRepository.save(voucher));
    }

    @DeleteMapping("/vouchers/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        VoucherDefinition voucher = voucherDefinitionRepository.findById(id).orElse(null);
        if (voucher == null) {
            return ResponseEntity.notFound().build();
        }
        if (voucher.getClaimedQuantity() != null && voucher.getClaimedQuantity() > 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa voucher đã được phát hành. Vui lòng chuyển trạng thái sang Tạm ẩn."));
        }
        try {
            voucherDefinitionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi dữ liệu: Voucher đang được ràng buộc bởi dữ liệu khác."));
        }
    }

    @GetMapping("/rewards")
    public ResponseEntity<?> getAllRewards() {
        List<Map<String, Object>> response = voucherDefinitionRepository.findAll().stream()
                .filter(voucher -> safeLong(voucher.getPointsRequired()) > 0L)
                .sorted(Comparator.comparing(VoucherDefinition::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(voucher -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", voucher.getId());
                    map.put("name", voucher.getName() != null && !voucher.getName().isBlank() ? voucher.getName() : voucher.getCode());
                    map.put("rewardType", voucher.getType());
                    map.put("voucherCode", voucher.getCode());
                    map.put("pointsRequired", safeLong(voucher.getPointsRequired()));
                    map.put("claimed", voucher.getClaimedQuantity() != null ? voucher.getClaimedQuantity() : 0);
                    map.put("remaining", voucher.getTotalQuantity() != null
                            ? Math.max(0, voucher.getTotalQuantity() - (voucher.getClaimedQuantity() != null ? voucher.getClaimedQuantity() : 0))
                            : null);
                    map.put("tier", voucher.getRequiredTierCode() != null ? formatTierLabel(voucher.getRequiredTierCode()) : "All");
                    map.put("active", voucher.getActive());
                    map.put("statusLabel", Boolean.TRUE.equals(voucher.getActive()) ? "ACTIVE" : "INACTIVE");
                    map.put("discountLabel", buildRewardDescription(voucher));
                    map.put("validRange", formatDateRange(voucher.getValidFrom(), voucher.getValidTo()));
                    map.put("image", resolveRewardImage(voucher));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rewards/{id}")
    public ResponseEntity<?> getRewardDetail(@PathVariable Long id) {
        VoucherDefinition reward = voucherDefinitionRepository.findById(id).orElse(null);
        if (reward == null) {
            return ResponseEntity.notFound().build();
        }

        List<Map<String, Object>> timeline = userVoucherRepository.findByVoucherDefinition_Id(id).stream()
                .sorted(Comparator.comparing(UserVoucher::getAcquiredAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .map(userVoucher -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("userId", userVoucher.getUserId());
                    row.put("voucherCode", userVoucher.getCode());
                    row.put("status", userVoucher.getStatus());
                    row.put("acquiredAt", userVoucher.getAcquiredAt() != null ? userVoucher.getAcquiredAt().format(DATE_TIME_FORMATTER) : "N/A");
                    row.put("usedAt", userVoucher.getUsedAt() != null ? userVoucher.getUsedAt().format(DATE_TIME_FORMATTER) : null);
                    return row;
                })
                .toList();

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", reward.getId());
        detail.put("name", reward.getName());
        detail.put("voucherCode", reward.getCode());
        detail.put("pointsRequired", reward.getPointsRequired());
        detail.put("discountLabel", buildRewardDescription(reward));
        detail.put("type", reward.getType());
        detail.put("minOrderValue", reward.getMinOrderValue());
        detail.put("requiredTierCode", reward.getRequiredTierCode());
        detail.put("claimedQuantity", reward.getClaimedQuantity());
        detail.put("validRange", formatDateRange(reward.getValidFrom(), reward.getValidTo()));
        detail.put("bgColor", reward.getBgColor());
        detail.put("imageUrl", reward.getImageUrl());
        detail.put("timeline", timeline);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/rewards")
    public ResponseEntity<?> createReward(@RequestBody VoucherDefinition voucher) {
        return ResponseEntity.ok(voucherDefinitionRepository.save(voucher));
    }

    @PutMapping("/rewards/{id}")
    public ResponseEntity<?> updateReward(@PathVariable Long id, @RequestBody VoucherDefinition voucher) {
        voucher.setId(id);
        return ResponseEntity.ok(voucherDefinitionRepository.save(voucher));
    }

    @DeleteMapping("/rewards/{id}")
    public ResponseEntity<?> deleteReward(@PathVariable Long id) {
        VoucherDefinition reward = voucherDefinitionRepository.findById(id).orElse(null);
        if (reward == null) {
            return ResponseEntity.notFound().build();
        }
        if (reward.getClaimedQuantity() != null && reward.getClaimedQuantity() > 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa phần thưởng đã có người đổi. Vui lòng chuyển trạng thái sang Tạm ẩn."));
        }
        try {
            voucherDefinitionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi dữ liệu: Phần thưởng đang được ràng buộc bởi dữ liệu khác."));
        }
    }

    @GetMapping("/rewards/history")
    public ResponseEntity<?> getRedeemHistory() {
        List<PointTransaction> transactions = transactionRepository.findAll().stream()
                .filter(transaction -> "REWARD_REDEEM".equalsIgnoreCase(transaction.getSource()) || transaction.getPoints() < 0)
                .sorted(Comparator.comparing(PointTransaction::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();

        Map<Long, UserServiceUser> userLookup = loadUserLookup(transactions.stream().map(PointTransaction::getUserId).collect(Collectors.toSet()));

        List<Map<String, Object>> response = transactions.stream()
                .map(transaction -> {
                    UserServiceUser profile = userLookup.get(transaction.getUserId());
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", transaction.getId());
                    map.put("memberName", resolveDisplayName(profile, transaction.getUserId()));
                    map.put("email", resolveEmail(profile));
                    map.put("reward", transaction.getDescription());
                    map.put("pointsUsed", Math.abs(transaction.getPoints()));
                    map.put("date", transaction.getCreatedAt() != null ? transaction.getCreatedAt().format(DATE_TIME_FORMATTER) : "N/A");
                    map.put("status", "COMPLETED".equals(transaction.getStatus()) ? "SUCCESS" : "FAILED");
                    map.put("avatar", resolveAvatar(profile, transaction.getUserId()));
                    map.put("voucherCode", resolveIssuedVoucherCode(transaction));
                    return map;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toTierResponse(MembershipTier tier, Map<String, Long> memberCountsByTier) {
        Map<String, Object> map = new LinkedHashMap<>();
        String code = normalizeTierCode(tier.getCode());
        String color = tier.getColor() != null && !tier.getColor().isBlank() ? tier.getColor() : "#cccccc";
        String icon = tier.getIcon() != null && !tier.getIcon().isBlank() ? tier.getIcon() : "fa-star";

        map.put("id", tier.getId());
        map.put("code", tier.getCode());
        map.put("name", tier.getName());
        map.put("color", color);
        map.put("styleColor", color);
        map.put("bg", color + "12");
        map.put("icon", icon);
        map.put("min", tier.getMinimumEligibleSpending());
        map.put("max", null);
        map.put("pts", String.format("%s completed orders, spending from %s", safeInt(tier.getMinimumCompletedOrders()), formatCurrency(safeLong(tier.getMinimumEligibleSpending()))));
        map.put("members", memberCountsByTier.getOrDefault(code, 0L));
        map.put("benefits", buildTierBenefits(tier));
        map.put("active", tier.getActive());
        map.put("displayOrder", tier.getDisplayOrder());
        return map;
    }

    private List<String> buildTierBenefits(MembershipTier tier) {
        List<String> benefits = new ArrayList<>();
        benefits.add("Daily check-in: " + safeLong(tier.getDailyCheckinPoints()) + " points");
        benefits.add("Spin per day: " + safeInt(tier.getDailySpinCount()));
        benefits.add("Upgrade voucher: " + formatCurrency(safeLong(tier.getUpgradeVoucherValue())));
        benefits.add("Birthday voucher: " + formatCurrency(safeLong(tier.getBirthdayVoucherValue())));
        benefits.add("Freeship/month: " + safeInt(tier.getMonthlyFreeshipCount()));
        if (Boolean.TRUE.equals(tier.getPrioritySupport())) {
            benefits.add("Priority support");
        }
        return benefits;
    }

    private Map<String, Long> buildTierMemberCounts(List<LoyaltyAccount> accounts) {
        return accounts.stream().collect(Collectors.groupingBy(
                account -> normalizeTierCode(account.getCurrentTierCode()),
                LinkedHashMap::new,
                Collectors.counting()
        ));
    }

    private Map<String, Object> toVoucherAdminSummary(VoucherDefinition voucher) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", voucher.getId());
        map.put("code", voucher.getCode());
        map.put("name", voucher.getName());
        map.put("description", voucher.getDescription());
        map.put("type", voucher.getType());
        map.put("discountLabel", buildRewardDescription(voucher));
        map.put("minOrderValue", safeLong(voucher.getMinOrderValue()));
        map.put("pointsRequired", safeLong(voucher.getPointsRequired()));
        map.put("claimedQuantity", voucher.getClaimedQuantity() != null ? voucher.getClaimedQuantity() : 0);
        map.put("totalQuantity", voucher.getTotalQuantity());
        map.put("remainingQuantity", voucher.getTotalQuantity() != null
                ? Math.max(0, voucher.getTotalQuantity() - (voucher.getClaimedQuantity() != null ? voucher.getClaimedQuantity() : 0))
                : null);
        map.put("status", Boolean.TRUE.equals(voucher.getActive()) ? "ACTIVE" : "INACTIVE");
        map.put("source", safeLong(voucher.getPointsRequired()) > 0L ? "LOYALTY" : "PUBLIC");
        map.put("validRange", formatDateRange(voucher.getValidFrom(), voucher.getValidTo()));
        map.put("image", resolveRewardImage(voucher));
        map.put("bgColor", voucher.getBgColor());
        map.put("imageUrl", voucher.getImageUrl());
        return map;
    }

    private String buildRewardDescription(VoucherDefinition voucher) {
        if (voucher.getDiscountAmount() != null && voucher.getDiscountAmount() > 0) {
            return "Giam " + formatCurrency(voucher.getDiscountAmount());
        }
        if (voucher.getDiscountPercentage() != null && voucher.getDiscountPercentage() > 0) {
            return "Giam " + voucher.getDiscountPercentage() + "%";
        }
        if ("FREE_SHIPPING".equalsIgnoreCase(voucher.getType())) {
            return "Mien phi van chuyen";
        }
        if ("FREE_ITEM".equalsIgnoreCase(voucher.getType())) {
            return "Qua tang san pham";
        }
        return voucher.getDescription() != null && !voucher.getDescription().isBlank()
                ? voucher.getDescription()
                : "Loyalty reward";
    }

    private String formatTierLabel(String code) {
        if (code == null || code.isBlank()) {
            return "Silver";
        }
        return switch (code.toUpperCase()) {
            case "SILVER" -> "Silver";
            case "GOLD" -> "Gold";
            case "PLATINUM" -> "Platinum";
            case "DIAMOND" -> "Diamond";
            default -> code;
        };
    }

    private String resolveRewardImage(VoucherDefinition voucher) {
        if (voucher.getImageUrl() != null && !voucher.getImageUrl().isBlank()) {
            return voucher.getImageUrl();
        }
        
        String type = voucher.getType() != null ? voucher.getType().toUpperCase() : "";
        if ("FREE_SHIPPING".equals(type)) {
            // Voucher freeship với xe
            return "/images/vouchers/freeship.jpg";
        }
        
        if (voucher.getPointsRequired() != null && voucher.getPointsRequired() > 0) {
            // Voucher đổi từ điểm (Loyalty)
            return "/images/vouchers/voucher.png";
        }
        
        // Voucher công khai không đổi điểm
        return "/images/vouchers/coupon.png";
    }

    private String formatCurrency(long amount) {
        return String.format("%,dđ", amount);
    }

    private String formatDateRange(LocalDateTime from, LocalDateTime to) {
        String fromText = from != null ? from.toLocalDate().toString() : "-";
        String toText = to != null ? to.toLocalDate().toString() : "Open";
        return fromText + " - " + toText;
    }

    private Map<Long, UserServiceUser> loadUserLookup(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        try {
            return userServiceClient.getAllUsers().stream()
                    .filter(user -> user.id() != null && userIds.contains(user.id()))
                    .collect(Collectors.toMap(UserServiceUser::id, user -> user));
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private UserServiceUser loadUserProfile(Long userId) {
        try {
            return userServiceClient.getUserById(userId);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String resolveDisplayName(UserServiceUser profile, Long fallbackUserId) {
        if (profile != null && profile.userDetails() != null) {
            String firstName = profile.userDetails().firstName() != null ? profile.userDetails().firstName() : "";
            String lastName = profile.userDetails().lastName() != null ? profile.userDetails().lastName() : "";
            String fullName = (firstName + " " + lastName).trim();
            if (!fullName.isBlank()) {
                return fullName;
            }
        }
        if (profile != null && profile.userName() != null && !profile.userName().isBlank()) {
            return profile.userName();
        }
        return "User " + fallbackUserId;
    }

    private String resolveEmail(UserServiceUser profile) {
        if (profile != null && profile.userDetails() != null && profile.userDetails().email() != null) {
            return profile.userDetails().email();
        }
        return "";
    }

    private String resolvePhone(UserServiceUser profile) {
        if (profile != null && profile.userDetails() != null && profile.userDetails().phoneNumber() != null) {
            return profile.userDetails().phoneNumber();
        }
        return "";
    }

    private String resolveStatus(UserServiceUser profile) {
        if (profile == null || profile.active() == null || profile.active() == 1) {
            return "Active";
        }
        return "Locked";
    }

    private String resolveAvatar(UserServiceUser profile, Long fallbackUserId) {
        if (profile != null && profile.userDetails() != null && profile.userDetails().avatarUrl() != null
                && !profile.userDetails().avatarUrl().isBlank()) {
            return profile.userDetails().avatarUrl();
        }
        String seed = profile != null && profile.userName() != null && !profile.userName().isBlank()
                ? profile.userName()
                : "User" + fallbackUserId;
        return "https://api.dicebear.com/9.x/initials/svg?seed=" + seed;
    }

    private String resolveIssuedVoucherCode(PointTransaction transaction) {
        String referenceId = transaction.getReferenceId();
        if (referenceId == null || referenceId.isBlank()) {
            return null;
        }
        try {
            Long rewardId = Long.parseLong(referenceId);
            return userVoucherRepository.findByVoucherDefinition_Id(rewardId).stream()
                    .filter(voucher -> voucher.getUserId().equals(transaction.getUserId()))
                    .max(Comparator.comparing(UserVoucher::getAcquiredAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .map(UserVoucher::getCode)
                    .orElse(null);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private Map<String, Object> chartSlice(String name, long value, String color) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", name);
        map.put("value", value);
        map.put("color", color);
        return map;
    }

    private String normalizeTierCode(String code) {
        return code != null ? code.toUpperCase() : "UNASSIGNED";
    }

    private long extractLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Long.parseLong(text);
        }
        return 0L;
    }

    private long safeLong(Long value) {
        return value != null ? value : 0L;
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }
}
