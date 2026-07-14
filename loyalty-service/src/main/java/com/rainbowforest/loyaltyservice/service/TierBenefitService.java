package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.TierBenefitClaim;
import com.rainbowforest.loyaltyservice.domain.VoucherDefinition;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.TierBenefitClaimRepository;
import com.rainbowforest.loyaltyservice.repository.VoucherDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class TierBenefitService {

    @Autowired
    private TierBenefitClaimRepository claimRepository;

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherDefinitionRepository voucherDefRepo;

    public void claimMonthlyBenefits(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        Optional<TierBenefitClaim> existingClaim = claimRepository.findByUserIdAndClaimYearAndClaimMonth(userId, year, month);
        if (existingClaim.isPresent()) {
            throw new RuntimeException("Bạn đã nhận quyền lợi tháng này rồi");
        }

        LoyaltyAccount account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản loyalty"));
                
        MembershipTier tier = tierRepository.findByCode(account.getCurrentTierCode())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng thành viên"));

        // Issue Upgrade Voucher based on tier
        String upgradeVoucherCode = null;
        if ("SILVER".equals(tier.getCode()) || "GOLD".equals(tier.getCode())) {
            upgradeVoucherCode = "TIER_UPGRADE_30K";
        } else if ("PLATINUM".equals(tier.getCode())) {
            upgradeVoucherCode = "TIER_UPGRADE_50K";
        } else if ("DIAMOND".equals(tier.getCode())) {
            upgradeVoucherCode = "TIER_UPGRADE_60K";
        }

        if (upgradeVoucherCode != null) {
            String finalUpgradeVoucherCode = upgradeVoucherCode;
            Optional<VoucherDefinition> upgDef = voucherDefRepo.findByActiveTrue().stream()
                    .filter(v -> v.getCode().equals(finalUpgradeVoucherCode))
                    .findFirst();
            upgDef.ifPresent(def -> voucherService.issueVoucherToUser(userId, def));
        }

        // Issue Freeship Vouchers based on tier count
        int freeshipCount = tier.getMonthlyFreeshipCount();
        if (freeshipCount > 0) {
            Optional<VoucherDefinition> fsDef = voucherDefRepo.findByActiveTrue().stream()
                    .filter(v -> v.getCode().equals("TIER_FREESHIP"))
                    .findFirst();
            if (fsDef.isPresent()) {
                for (int i = 0; i < freeshipCount; i++) {
                    voucherService.issueVoucherToUser(userId, fsDef.get());
                }
            }
        }

        // Save Claim Record
        TierBenefitClaim claim = TierBenefitClaim.builder()
                .userId(userId)
                .tierCode(tier.getCode())
                .claimYear(year)
                .claimMonth(month)
                .claimedAt(now)
                .build();
        claimRepository.save(claim);
    }
    
    public boolean checkClaimedThisMonth(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return claimRepository.findByUserIdAndClaimYearAndClaimMonth(userId, now.getYear(), now.getMonthValue()).isPresent();
    }
}
