package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.TierBenefitClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TierBenefitClaimRepository extends JpaRepository<TierBenefitClaim, Long> {
    Optional<TierBenefitClaim> findByUserIdAndClaimYearAndClaimMonth(Long userId, Integer claimYear, Integer claimMonth);
}
