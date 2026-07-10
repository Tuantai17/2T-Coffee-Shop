package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipTierRepository extends JpaRepository<MembershipTier, Long> {
    Optional<MembershipTier> findByCode(String code);
}
