package com.rainbowforest.loyaltyservice.config;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.LoyaltyRule;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.VoucherDefinition;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.LoyaltyRuleRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.VoucherDefinitionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class LoyaltySeedConfig {

    @Bean
    CommandLineRunner seedLoyaltyData(
            MembershipTierRepository tierRepository,
            LoyaltyRuleRepository ruleRepository,
            VoucherDefinitionRepository voucherRepository,
            LoyaltyAccountRepository accountRepository
    ) {
        return args -> {
            seedTiers(tierRepository);
            seedRules(ruleRepository);
            seedRewards(voucherRepository);
            seedAccounts(accountRepository);
        };
    }

    private void seedTiers(MembershipTierRepository tierRepository) {
        List<MembershipTier> tiers = List.of(
                MembershipTier.builder()
                        .code("SILVER")
                        .name("Silver")
                        .minimumCompletedOrders(0)
                        .minimumEligibleSpending(0L)
                        .evaluationMonths(6)
                        .dailyCheckinPoints(5L)
                        .dailySpinCount(1)
                        .upgradeVoucherValue(15000L)
                        .birthdayVoucherValue(20000L)
                        .monthlyFreeshipCount(1)
                        .prioritySupport(false)
                        .displayOrder(1)
                        .active(true)
                        .build(),
                MembershipTier.builder()
                        .code("GOLD")
                        .name("Gold")
                        .minimumCompletedOrders(8)
                        .minimumEligibleSpending(1500000L)
                        .evaluationMonths(6)
                        .dailyCheckinPoints(8L)
                        .dailySpinCount(2)
                        .upgradeVoucherValue(30000L)
                        .birthdayVoucherValue(50000L)
                        .monthlyFreeshipCount(2)
                        .prioritySupport(false)
                        .displayOrder(2)
                        .active(true)
                        .build(),
                MembershipTier.builder()
                        .code("PLATINUM")
                        .name("Platinum")
                        .minimumCompletedOrders(15)
                        .minimumEligibleSpending(4000000L)
                        .evaluationMonths(6)
                        .dailyCheckinPoints(12L)
                        .dailySpinCount(3)
                        .upgradeVoucherValue(60000L)
                        .birthdayVoucherValue(80000L)
                        .monthlyFreeshipCount(4)
                        .prioritySupport(true)
                        .displayOrder(3)
                        .active(true)
                        .build(),
                MembershipTier.builder()
                        .code("DIAMOND")
                        .name("Diamond")
                        .minimumCompletedOrders(25)
                        .minimumEligibleSpending(8000000L)
                        .evaluationMonths(6)
                        .dailyCheckinPoints(20L)
                        .dailySpinCount(5)
                        .upgradeVoucherValue(100000L)
                        .birthdayVoucherValue(150000L)
                        .monthlyFreeshipCount(8)
                        .prioritySupport(true)
                        .displayOrder(4)
                        .active(true)
                        .build()
        );

        for (MembershipTier tier : tiers) {
            if (tierRepository.findByCode(tier.getCode()).isEmpty()) {
                tierRepository.save(tier);
            }
        }
    }

    private void seedRules(LoyaltyRuleRepository ruleRepository) {
        List<LoyaltyRule> rules = List.of(
                LoyaltyRule.builder()
                        .name("Tich diem theo don hang")
                        .type("Tich diem")
                        .condition("Moi 1.000 VND chi tieu hop le nhan 1 diem")
                        .point(1L)
                        .status(true)
                        .build(),
                LoyaltyRule.builder()
                        .name("Thuong diem danh hang ngay")
                        .type("Tich diem")
                        .condition("Dang nhap va diem danh moi ngay")
                        .point(5L)
                        .status(true)
                        .build(),
                LoyaltyRule.builder()
                        .name("Tru diem khi doi voucher")
                        .type("Tru diem")
                        .condition("Doi reward trong kho Loyalty")
                        .point(50L)
                        .status(true)
                        .build()
        );

        if (ruleRepository.count() == 0) {
            ruleRepository.saveAll(rules);
        }
    }

    private void seedRewards(VoucherDefinitionRepository voucherRepository) {
        LocalDateTime now = LocalDateTime.now();
        List<VoucherDefinition> rewards = List.of(
                VoucherDefinition.builder()
                        .code("LOYALTY10")
                        .name("Voucher giam 10%")
                        .description("Giam 10% toi da 30.000d")
                        .type("PERCENTAGE")
                        .discountPercentage(10)
                        .maxDiscountAmount(30000L)
                        .minOrderValue(99000L)
                        .pointsRequired(120L)
                        .maxClaimsPerUser(2)
                        .totalQuantity(500)
                        .claimedQuantity(28)
                        .active(true)
                        .validFrom(now.minusDays(7))
                        .validTo(now.plusMonths(6))
                        .build(),
                VoucherDefinition.builder()
                        .code("LOYALTY30K")
                        .name("Voucher giam 30.000d")
                        .description("Ap dung cho don tu 149.000d")
                        .type("FIXED_AMOUNT")
                        .discountAmount(30000L)
                        .minOrderValue(149000L)
                        .pointsRequired(180L)
                        .maxClaimsPerUser(2)
                        .totalQuantity(300)
                        .claimedQuantity(15)
                        .active(true)
                        .validFrom(now.minusDays(7))
                        .validTo(now.plusMonths(6))
                        .build(),
                VoucherDefinition.builder()
                        .code("FREESHIPVIP")
                        .name("Voucher freeship")
                        .description("Mien phi van chuyen toan quoc")
                        .type("FREE_SHIPPING")
                        .minOrderValue(50000L)
                        .requiredTierCode("GOLD")
                        .pointsRequired(90L)
                        .maxClaimsPerUser(3)
                        .totalQuantity(400)
                        .claimedQuantity(42)
                        .active(true)
                        .validFrom(now.minusDays(7))
                        .validTo(now.plusMonths(6))
                        .build()
        );

        for (VoucherDefinition reward : rewards) {
            if (voucherRepository.findByCode(reward.getCode()).isEmpty()) {
                voucherRepository.save(reward);
            }
        }
    }

    private void seedAccounts(LoyaltyAccountRepository accountRepository) {
        List<LoyaltyAccount> accounts = List.of(
                LoyaltyAccount.builder()
                        .userId(2L)
                        .availablePoints(2450L)
                        .pendingPoints(120L)
                        .reservedPoints(0L)
                        .lifetimeEarnedPoints(5200L)
                        .lifetimeUsedPoints(1200L)
                        .currentTierCode("SILVER")
                        .version(0L)
                        .build(),
                LoyaltyAccount.builder()
                        .userId(3L)
                        .availablePoints(8200L)
                        .pendingPoints(200L)
                        .reservedPoints(100L)
                        .lifetimeEarnedPoints(14800L)
                        .lifetimeUsedPoints(4200L)
                        .currentTierCode("GOLD")
                        .version(0L)
                        .build(),
                LoyaltyAccount.builder()
                        .userId(4L)
                        .availablePoints(16800L)
                        .pendingPoints(350L)
                        .reservedPoints(200L)
                        .lifetimeEarnedPoints(26500L)
                        .lifetimeUsedPoints(7500L)
                        .currentTierCode("PLATINUM")
                        .version(0L)
                        .build(),
                LoyaltyAccount.builder()
                        .userId(5L)
                        .availablePoints(35200L)
                        .pendingPoints(500L)
                        .reservedPoints(300L)
                        .lifetimeEarnedPoints(48200L)
                        .lifetimeUsedPoints(9200L)
                        .currentTierCode("DIAMOND")
                        .version(0L)
                        .build()
        );

        for (LoyaltyAccount account : accounts) {
            if (accountRepository.findByUserId(account.getUserId()).isEmpty()) {
                accountRepository.save(account);
            }
        }
    }
}
