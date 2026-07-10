package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinMissionRepository extends JpaRepository<CheckinMission, Long> {
    List<CheckinMission> findByStatusOrderByDisplayOrderAsc(String status);
}
