package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinProgramLuckyDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinProgramLuckyDayRepository extends JpaRepository<CheckinProgramLuckyDay, Long> {
    List<CheckinProgramLuckyDay> findByProgramId(Long programId);
    Optional<CheckinProgramLuckyDay> findByProgramIdAndLuckyDate(Long programId, LocalDate luckyDate);
    void deleteByProgramId(Long programId);
}
