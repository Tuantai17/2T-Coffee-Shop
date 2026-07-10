package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.DailyCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface DailyCheckinRepository extends JpaRepository<DailyCheckin, Long> {
    Optional<DailyCheckin> findByUserIdAndCheckinDate(Long userId, LocalDate checkinDate);
    Optional<DailyCheckin> findFirstByUserIdOrderByCheckinDateDesc(Long userId);
    List<DailyCheckin> findByUserIdOrderByCheckinDateDesc(Long userId);
}
