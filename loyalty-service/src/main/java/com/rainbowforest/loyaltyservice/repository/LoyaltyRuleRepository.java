package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.LoyaltyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoyaltyRuleRepository extends JpaRepository<LoyaltyRule, Long> {
}
