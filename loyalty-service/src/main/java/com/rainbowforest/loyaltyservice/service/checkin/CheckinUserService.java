package com.rainbowforest.loyaltyservice.service.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRecord;
import com.rainbowforest.loyaltyservice.domain.checkin.UserCheckinStreak;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinRecordRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.UserCheckinStreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
public class CheckinUserService {
    @Autowired
    private CheckinRecordRepository recordRepository;
    @Autowired
    private UserCheckinStreakRepository streakRepository;

    public Optional<CheckinRecord> getTodayCheckin(Long userId) {
        return recordRepository.findByUserIdAndBusinessDate(userId, LocalDate.now());
    }
    
    public UserCheckinStreak getUserStreak(Long userId) {
        return streakRepository.findById(userId).orElse(new UserCheckinStreak());
    }
}
