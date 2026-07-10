package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRewardCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinRewardCycleRepository extends JpaRepository<CheckinRewardCycle, Long> {
    List<CheckinRewardCycle> findByStatus(String status);
    Optional<CheckinRewardCycle> findFirstByStatusOrderByIdDesc(String status);
}
