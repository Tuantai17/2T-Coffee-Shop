package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinRecordRepository extends JpaRepository<CheckinRecord, Long> {
    Optional<CheckinRecord> findByUserIdAndBusinessDate(Long userId, LocalDate businessDate);
    List<CheckinRecord> findByUserIdAndBusinessDateBetweenOrderByBusinessDateDesc(Long userId, LocalDate startDate, LocalDate endDate);
    List<CheckinRecord> findTop30ByUserIdOrderByBusinessDateDesc(Long userId);
    
    long countByBusinessDate(LocalDate businessDate);
    long countByBusinessDateBetween(LocalDate startDate, LocalDate endDate);
}
