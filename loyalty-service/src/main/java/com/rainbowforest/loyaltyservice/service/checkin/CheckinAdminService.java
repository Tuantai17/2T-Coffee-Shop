package com.rainbowforest.loyaltyservice.service.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinConfig;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinCalendarEvent;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinMission;
import com.rainbowforest.loyaltyservice.domain.checkin.MysteryBox;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinAchievement;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinFaq;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinFaqRepository;
import com.rainbowforest.loyaltyservice.domain.checkin.UserCheckinStreak;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRecord;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinAchievementRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.MysteryBoxRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinMissionRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinCalendarEventRepository;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRewardCycle;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinRewardCycleRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinConfigRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.CheckinRecordRepository;
import com.rainbowforest.loyaltyservice.repository.checkin.UserCheckinStreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class CheckinAdminService {
    @Autowired
    private CheckinConfigRepository configRepository;
    
    @Autowired
    private CheckinRecordRepository recordRepository;
    
    @Autowired
    private UserCheckinStreakRepository streakRepository;

    @Autowired
    private CheckinRewardCycleRepository cycleRepository;

    @Autowired
    private CheckinCalendarEventRepository calendarRepository;

    @Autowired
    private CheckinMissionRepository missionRepository;

    @Autowired
    private MysteryBoxRepository mysteryBoxRepository;

    @Autowired
    private CheckinAchievementRepository achievementRepository;

    @Autowired
    private CheckinFaqRepository faqRepository;


    public List<CheckinRewardCycle> getAllRewardCycles() {
        return cycleRepository.findAll();
    }
    
    public CheckinRewardCycle getRewardCycle(Long id) {
        return cycleRepository.findById(id).orElseThrow(() -> new RuntimeException("Cycle not found"));
    }
    
    public CheckinRewardCycle createRewardCycle(CheckinRewardCycle cycle) {
        cycle.setStatus("DRAFT");
        return cycleRepository.save(cycle);
    }
    
    public CheckinRewardCycle updateRewardCycle(Long id, CheckinRewardCycle cycle) {
        CheckinRewardCycle existing = getRewardCycle(id);
        existing.setName(cycle.getName());
        existing.setDescription(cycle.getDescription());
        existing.setDays(cycle.getDays());
        existing.setCycleType(cycle.getCycleType());
        existing.setStartDate(cycle.getStartDate());
        existing.setEndDate(cycle.getEndDate());
        existing.setIsRepeatable(cycle.getIsRepeatable());
        return cycleRepository.save(existing);
    }
    
    public void deleteRewardCycle(Long id) {
        cycleRepository.deleteById(id);
    }
    
    public CheckinRewardCycle updateRewardCycleStatus(Long id, String status) {
        CheckinRewardCycle existing = getRewardCycle(id);
        existing.setStatus(status);
        return cycleRepository.save(existing);
    }


    public List<CheckinCalendarEvent> getAllCalendarEvents() {
        return calendarRepository.findAll();
    }
    
    public CheckinCalendarEvent getCalendarEvent(Long id) {
        return calendarRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }
    
    public CheckinCalendarEvent createCalendarEvent(CheckinCalendarEvent event) {
        return calendarRepository.save(event);
    }
    
    public CheckinCalendarEvent updateCalendarEvent(Long id, CheckinCalendarEvent event) {
        CheckinCalendarEvent existing = getCalendarEvent(id);
        existing.setEventDate(event.getEventDate());
        existing.setType(event.getType());
        existing.setStatus(event.getStatus());
        existing.setBasePoints(event.getBasePoints());
        existing.setMultiplier(event.getMultiplier());
        existing.setBonusPoints(event.getBonusPoints());
        existing.setVoucherId(event.getVoucherId());
        existing.setRewardId(event.getRewardId());
        existing.setDisplayText(event.getDisplayText());
        return calendarRepository.save(existing);
    }
    
    public void deleteCalendarEvent(Long id) {
        calendarRepository.deleteById(id);
    }


    public List<CheckinMission> getAllMissions() {
        return missionRepository.findAll();
    }
    
    public CheckinMission getMission(Long id) {
        return missionRepository.findById(id).orElseThrow(() -> new RuntimeException("Mission not found"));
    }
    
    public CheckinMission createMission(CheckinMission mission) {
        mission.setStatus("ACTIVE");
        mission.setTotalCompleted(0);
        return missionRepository.save(mission);
    }
    
    public CheckinMission updateMission(Long id, CheckinMission mission) {
        CheckinMission existing = getMission(id);
        existing.setName(mission.getName());
        existing.setDescription(mission.getDescription());
        existing.setIcon(mission.getIcon());
        existing.setEventType(mission.getEventType());
        existing.setTargetValue(mission.getTargetValue());
        existing.setCycle(mission.getCycle());
        existing.setRewardPoints(mission.getRewardPoints());
        existing.setRewardVoucherId(mission.getRewardVoucherId());
        existing.setDisplayOrder(mission.getDisplayOrder());
        existing.setStartDate(mission.getStartDate());
        existing.setEndDate(mission.getEndDate());
        return missionRepository.save(existing);
    }
    
    public void deleteMission(Long id) {
        missionRepository.deleteById(id);
    }
    
    public CheckinMission updateMissionStatus(Long id, String status) {
        CheckinMission existing = getMission(id);
        existing.setStatus(status);
        return missionRepository.save(existing);
    }


    public List<MysteryBox> getAllMysteryBoxes() {
        return mysteryBoxRepository.findAll();
    }
    
    public MysteryBox getMysteryBox(Long id) {
        return mysteryBoxRepository.findById(id).orElseThrow(() -> new RuntimeException("Mystery Box not found"));
    }
    
    public MysteryBox createMysteryBox(MysteryBox box) {
        box.setStatus("ACTIVE");
        return mysteryBoxRepository.save(box);
    }
    
    public MysteryBox updateMysteryBox(Long id, MysteryBox box) {
        MysteryBox existing = getMysteryBox(id);
        existing.setName(box.getName());
        existing.setDescription(box.getDescription());
        existing.setImageUrl(box.getImageUrl());
        existing.setMaxOpens(box.getMaxOpens());
        existing.setTotalOpens(box.getTotalOpens());
        existing.setRequiredDays(box.getRequiredDays());
        existing.setIsRepeatable(box.getIsRepeatable());
        existing.setStartDate(box.getStartDate());
        existing.setEndDate(box.getEndDate());
        return mysteryBoxRepository.save(existing);
    }
    
    public void deleteMysteryBox(Long id) {
        mysteryBoxRepository.deleteById(id);
    }
    
    public MysteryBox updateMysteryBoxStatus(Long id, String status) {
        MysteryBox existing = getMysteryBox(id);
        existing.setStatus(status);
        return mysteryBoxRepository.save(existing);
    }


    public List<CheckinAchievement> getAllAchievements() {
        return achievementRepository.findAll();
    }
    
    public CheckinAchievement getAchievement(Long id) {
        return achievementRepository.findById(id).orElseThrow(() -> new RuntimeException("Achievement not found"));
    }
    
    public CheckinAchievement createAchievement(CheckinAchievement achievement) {
        achievement.setStatus("ACTIVE");
        achievement.setTotalAchieved(0);
        return achievementRepository.save(achievement);
    }
    
    public CheckinAchievement updateAchievement(Long id, CheckinAchievement achievement) {
        CheckinAchievement existing = getAchievement(id);
        existing.setName(achievement.getName());
        existing.setDescription(achievement.getDescription());
        existing.setIcon(achievement.getIcon());
        existing.setBadgeColor(achievement.getBadgeColor());
        existing.setConditionType(achievement.getConditionType());
        existing.setTargetValue(achievement.getTargetValue());
        existing.setRewardPoints(achievement.getRewardPoints());
        existing.setRewardVoucherId(achievement.getRewardVoucherId());
        existing.setShowProgress(achievement.getShowProgress());
        return achievementRepository.save(existing);
    }
    
    public void deleteAchievement(Long id) {
        achievementRepository.deleteById(id);
    }
    
    public CheckinAchievement updateAchievementStatus(Long id, String status) {
        CheckinAchievement existing = getAchievement(id);
        existing.setStatus(status);
        return achievementRepository.save(existing);
    }


    public List<UserCheckinStreak> getAllUserStreaks() {
        return streakRepository.findAll();
    }
    
    public List<CheckinRecord> getAllCheckinRecords() {
        return recordRepository.findAll();
    }


    public List<CheckinFaq> getAllFaqs() {
        return faqRepository.findAll();
    }
    
    public CheckinFaq getFaq(Long id) {
        return faqRepository.findById(id).orElseThrow(() -> new RuntimeException("FAQ not found"));
    }
    
    public CheckinFaq createFaq(CheckinFaq faq) {
        faq.setStatus("ACTIVE");
        return faqRepository.save(faq);
    }
    
    public CheckinFaq updateFaq(Long id, CheckinFaq faq) {
        CheckinFaq existing = getFaq(id);
        existing.setQuestion(faq.getQuestion());
        existing.setAnswer(faq.getAnswer());
        // no category field
        existing.setDisplayOrder(faq.getDisplayOrder());
        return faqRepository.save(existing);
    }
    
    public void deleteFaq(Long id) {
        faqRepository.deleteById(id);
    }
    
    public CheckinFaq updateFaqStatus(Long id, String status) {
        CheckinFaq existing = getFaq(id);
        existing.setStatus(status);
        return faqRepository.save(existing);
    }

    public CheckinConfig getConfig() {
        return configRepository.findByIsActiveTrue().orElse(null);
    }
    
    public CheckinConfig saveConfig(CheckinConfig config) {
        return configRepository.save(config);
    }
    
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        
        // 1. Summary
        Map<String, Object> summary = new HashMap<>();
        LocalDate today = LocalDate.now();
        
        long todayCheckIns = recordRepository.countByBusinessDate(today);
        summary.put("todayCheckIns", todayCheckIns);
        
        // Mock some values for total users to calculate rate
        long totalUsers = 100; // In reality, fetch from user service or local table
        summary.put("todayCompletionRate", totalUsers > 0 ? (todayCheckIns * 100.0 / totalUsers) : 0);
        
        LocalDate startOfMonth = today.withDayOfMonth(1);
        long monthlyCheckIns = recordRepository.countByBusinessDateBetween(startOfMonth, today);
        summary.put("monthlyCheckIns", monthlyCheckIns);
        
        // In reality, this requires summing up reward points and vouchers. For now, estimate.
        summary.put("monthlyPointsIssued", monthlyCheckIns * 10);
        summary.put("monthlyVouchersIssued", monthlyCheckIns / 5);
        
        // Calculate Streaks
        summary.put("averageStreak", 0);
        summary.put("highestStreak", 0);
        summary.put("returningUsers", todayCheckIns); // Approximation
        
        response.put("summary", summary);
        
        // 2. Trend Data
        List<Map<String, Object>> checkInTrend = new ArrayList<>();
        List<Map<String, Object>> voucherTrend = new ArrayList<>();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long checkins = recordRepository.countByBusinessDate(date);
            
            Map<String, Object> trendItem = new HashMap<>();
            trendItem.put("date", date.format(formatter));
            trendItem.put("checkIns", checkins);
            checkInTrend.add(trendItem);
            
            Map<String, Object> voucherItem = new HashMap<>();
            voucherItem.put("date", date.format(formatter));
            voucherItem.put("vouchers", checkins / 5); // Mock voucher ratio
            voucherTrend.add(voucherItem);
        }
        
        response.put("checkInTrend", checkInTrend);
        response.put("voucherTrend", voucherTrend);
        response.put("pointsTrend", new ArrayList<>());
        response.put("streakDistribution", new ArrayList<>());
        
        Map<String, Object> rewardCycle = new HashMap<>();
        rewardCycle.put("sevenDayRate", 0);
        rewardCycle.put("thirtyDayRate", 0);
        response.put("rewardCycleCompletion", rewardCycle);
        
        response.put("recentActivities", new ArrayList<>());

        return response;
    }
}
