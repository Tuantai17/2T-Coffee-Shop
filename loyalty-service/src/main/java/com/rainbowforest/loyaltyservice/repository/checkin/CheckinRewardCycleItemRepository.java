package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRewardCycleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinRewardCycleItemRepository extends JpaRepository<CheckinRewardCycleItem, Long> {
    List<CheckinRewardCycleItem> findByCycleIdOrderByDayNumberAsc(Long cycleId);
    void deleteByCycleId(Long cycleId);
}
