package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.MemberTierHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberTierHistoryRepository extends JpaRepository<MemberTierHistory, Long> {
    List<MemberTierHistory> findByUserIdOrderByChangedAtDesc(Long userId);
}
