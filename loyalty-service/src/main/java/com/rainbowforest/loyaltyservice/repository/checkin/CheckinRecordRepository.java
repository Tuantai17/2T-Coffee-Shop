package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface CheckinRecordRepository extends JpaRepository<CheckinRecord, Long> {
    Optional<CheckinRecord> findByProgramIdAndUserIdAndBusinessDate(Long programId, Long userId, LocalDate businessDate);
    List<CheckinRecord> findByProgramIdAndUserIdOrderByBusinessDateDesc(Long programId, Long userId);
    List<CheckinRecord> findByProgramId(Long programId);
    List<CheckinRecord> findByProgramIdAndUserIdAndBusinessDateBetweenOrderByBusinessDateAsc(Long programId, Long userId, LocalDate start, LocalDate end);
}
