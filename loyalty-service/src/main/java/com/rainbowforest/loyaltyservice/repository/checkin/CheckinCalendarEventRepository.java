package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinCalendarEventRepository extends JpaRepository<CheckinCalendarEvent, Long> {
    List<CheckinCalendarEvent> findByEventDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, String status);
    Optional<CheckinCalendarEvent> findByEventDateAndStatus(LocalDate eventDate, String status);
}
