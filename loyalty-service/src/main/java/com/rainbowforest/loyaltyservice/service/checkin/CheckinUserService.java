package com.rainbowforest.loyaltyservice.service.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.*;
import com.rainbowforest.loyaltyservice.repository.checkin.*;
import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CheckinUserService {
    @Autowired
    private CheckinProgramRepository programRepository;

    @Autowired
    private CheckinProgramRewardRepository rewardRepository;

    @Autowired
    private CheckinRecordRepository recordRepository;

    @Autowired
    private UserCheckinProgressRepository progressRepository;
    
    @Autowired
    private CheckinProgramLuckyDayRepository luckyDayRepository;
    
    @Autowired
    private com.rainbowforest.loyaltyservice.service.LoyaltyEngineService loyaltyEngineService;

    @Autowired
    private LoyaltyAccountRepository accountRepository;

    @Autowired
    private MembershipTierRepository tierRepository;

    public CheckinProgram getActiveProgram() {
        List<CheckinProgram> activePrograms = programRepository.findByStatus("ACTIVE");
        if (activePrograms.isEmpty()) return null;
        return activePrograms.get(0);
    }
    
    public List<CheckinProgramReward> getProgramRewards(Long programId) {
        return rewardRepository.findByProgramIdOrderByDayNumberAsc(programId);
    }

    public List<CheckinProgramLuckyDay> getProgramLuckyDays(Long programId) {
        return luckyDayRepository.findByProgramId(programId);
    }

    public Optional<CheckinRecord> getTodayCheckin(Long programId, Long userId) {
        return recordRepository.findByProgramIdAndUserIdAndBusinessDate(programId, userId, LocalDate.now());
    }
    
    public List<CheckinRecord> getHistory(Long programId, Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return recordRepository.findByProgramIdAndUserIdAndBusinessDateBetweenOrderByBusinessDateAsc(programId, userId, start, end);
    }
    
    public List<CheckinRecord> getUserHistory(Long programId, Long userId) {
        return recordRepository.findByProgramIdAndUserIdOrderByBusinessDateDesc(programId, userId);
    }
    
    public UserCheckinProgress getUserProgress(Long programId, Long userId) {
        return progressRepository.findByProgramIdAndUserId(programId, userId)
                .orElse(createNewProgress(programId, userId));
    }
    
    private UserCheckinProgress createNewProgress(Long programId, Long userId) {
        UserCheckinProgress p = new UserCheckinProgress();
        p.setProgramId(programId);
        p.setUserId(userId);
        return p;
    }

    public CheckinRecord performCheckin(Long userId, Long programId) {
        CheckinProgram program = programRepository.findById(programId).orElseThrow(() -> new RuntimeException("Program not found"));
        if (!"ACTIVE".equals(program.getStatus())) {
            throw new RuntimeException("Program is not active");
        }
        
        LocalDate today = LocalDate.now();
        Optional<CheckinRecord> existing = getTodayCheckin(programId, userId);
        if (existing.isPresent()) {
            throw new RuntimeException("Already checked in today");
        }
        
        UserCheckinProgress progress = getUserProgress(programId, userId);
        
        int streakBefore = progress.getCurrentStreak();
        int dayNumber = progress.getCurrentDay() + 1;
        
        if (program.getResetOnMiss() && progress.getLastCheckinDate() != null) {
            if (progress.getLastCheckinDate().isBefore(today.minusDays(1))) {
                streakBefore = 0;
                dayNumber = 1;
            }
        }
        
        // Loop back to 1 if we completed the cycle
        if (dayNumber > program.getTotalDays()) {
            if (program.getAllowRepeat()) {
                dayNumber = 1;
                streakBefore = 0;
            } else {
                throw new RuntimeException("You have already completed this check-in program.");
            }
        }
        
        int streakAfter = streakBefore + 1;
        
        int tierPoints = 0;
        Optional<LoyaltyAccount> accOpt = accountRepository.findByUserId(userId);
        if (accOpt.isPresent()) {
            Optional<MembershipTier> tierOpt = tierRepository.findByCode(accOpt.get().getCurrentTierCode());
            if (tierOpt.isPresent()) {
                tierPoints = tierOpt.get().getDailyCheckinPoints().intValue();
            }
        }
        
        // Find Reward
        int pointsAwarded = 0;
        String voucherId = null;
        List<CheckinProgramReward> rewards = rewardRepository.findByProgramIdOrderByDayNumberAsc(programId);
        for (CheckinProgramReward r : rewards) {
            if (r.getDayNumber() == dayNumber) {
                if ("POINTS".equals(r.getRewardType())) {
                    pointsAwarded += Integer.parseInt(r.getRewardValue());
                } else if ("VOUCHER".equals(r.getRewardType())) {
                    voucherId = r.getRewardValue();
                }
            }
        }
        
        // Apply Lucky Day Multiplier
        Optional<CheckinProgramLuckyDay> luckyDayOpt = luckyDayRepository.findByProgramIdAndLuckyDate(programId, today);
        if (luckyDayOpt.isPresent()) {
            CheckinProgramLuckyDay ld = luckyDayOpt.get();
            if ("ACTIVE".equals(ld.getStatus()) && (ld.getQuantityLimit() == null || ld.getQuantityUsed() < ld.getQuantityLimit())) {
                if (pointsAwarded > 0 && ld.getMultiplier() != null) {
                    pointsAwarded = (int) Math.round(pointsAwarded * ld.getMultiplier().doubleValue());
                }
                if (ld.getBonusPoints() != null && ld.getBonusPoints() > 0) {
                    pointsAwarded += ld.getBonusPoints();
                }
                if (voucherId == null && ld.getVoucherId() != null) {
                    voucherId = ld.getVoucherId();
                }
                ld.setQuantityUsed(ld.getQuantityUsed() + 1);
                luckyDayRepository.save(ld);
            }
        }
        
        // Add tier points after multiplier
        pointsAwarded += tierPoints;
        
        // Save Record
        CheckinRecord record = new CheckinRecord();
        record.setProgramId(programId);
        record.setUserId(userId);
        record.setBusinessDate(today);
        record.setCheckinTime(LocalDateTime.now());
        record.setDayNumber(dayNumber);
        record.setStreakBefore(streakBefore);
        record.setStreakAfter(streakAfter);
        record.setPointsAwarded(pointsAwarded);
        record.setVoucherId(voucherId);
        record.setStatus("SUCCESS");
        record = recordRepository.save(record);
        
        // Add Points to User Loyalty Account
        if (pointsAwarded > 0) {
            StringBuilder desc = new StringBuilder("Điểm danh ngày " + dayNumber);
            if (luckyDayOpt.isPresent() && "ACTIVE".equals(luckyDayOpt.get().getStatus())) {
                desc.append(" (x2 May mắn)");
            }
            if (tierPoints > 0) {
                String tierCode = accOpt.map(LoyaltyAccount::getCurrentTierCode).orElse("");
                desc.append(String.format(" (+%d Hạng %s)", tierPoints, tierCode));
            }
            loyaltyEngineService.addPointsFromCheckin(userId, pointsAwarded, programId, desc.toString());
        }
        
        // Update Progress
        progress.setCurrentDay(dayNumber);
        progress.setCurrentStreak(streakAfter);
        progress.setTotalCheckins(progress.getTotalCheckins() + 1);
        progress.setLastCheckinDate(today);
        if (streakAfter > progress.getLongestStreak()) {
            progress.setLongestStreak(streakAfter);
        }
        if (dayNumber == program.getTotalDays()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }
        progress.setUpdatedAt(LocalDateTime.now());
        progressRepository.save(progress);
        
        return record;
    }
}
