package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinMissionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinMissionProgressRepository extends JpaRepository<CheckinMissionProgress, Long> {
    Optional<CheckinMissionProgress> findByUserIdAndMissionIdAndBusinessDate(Long userId, Long missionId, LocalDate businessDate);
    List<CheckinMissionProgress> findByUserIdAndBusinessDate(Long userId, LocalDate businessDate);
}
