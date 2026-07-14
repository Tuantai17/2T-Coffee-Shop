package com.rainbowforest.loyaltyservice.service.checkin;

import com.rainbowforest.loyaltyservice.client.UserServiceClient;
import com.rainbowforest.loyaltyservice.client.UserServiceUser;
import com.rainbowforest.loyaltyservice.domain.checkin.*;
import com.rainbowforest.loyaltyservice.dto.checkin.AdminCheckinHistoryItem;
import com.rainbowforest.loyaltyservice.dto.checkin.AdminCheckinProgramDetailResponse;
import com.rainbowforest.loyaltyservice.dto.checkin.AdminCheckinProgramPayload;
import com.rainbowforest.loyaltyservice.repository.checkin.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CheckinAdminService {
    private static final Set<String> ALLOWED_PROGRAM_STATUSES = Set.of("DRAFT", "ACTIVE", "PAUSED", "ENDED");

    @Autowired
    private CheckinProgramRepository programRepository;
    
    @Autowired
    private CheckinProgramRewardRepository rewardRepository;

    @Autowired
    private CheckinProgramLuckyDayRepository luckyDayRepository;

    @Autowired
    private CheckinRecordRepository recordRepository;
    
    @Autowired
    private UserCheckinProgressRepository progressRepository;
    
    @Autowired
    private CheckinSettingRepository settingRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private com.rainbowforest.loyaltyservice.service.LoyaltyEngineService loyaltyEngineService;

    // --- Programs ---
    public List<Map<String, Object>> getAllPrograms(String search, String status) {
        List<CheckinProgram> programs = programRepository.findAll().stream()
                .sorted(Comparator.comparing(CheckinProgram::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        List<CheckinRecord> records = recordRepository.findAll();
        List<UserCheckinProgress> progressList = progressRepository.findAll();

        Map<Long, List<CheckinRecord>> recordsByProgram = records.stream()
                .collect(Collectors.groupingBy(CheckinRecord::getProgramId));
        Map<Long, List<UserCheckinProgress>> progressByProgram = progressList.stream()
                .collect(Collectors.groupingBy(UserCheckinProgress::getProgramId));

        String normalizedSearch = normalizeSearch(search);
        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";

        return programs.stream()
                .filter(program -> normalizedStatus.isBlank() || "ALL".equals(normalizedStatus) || normalizedStatus.equals(safeUpper(program.getStatus())))
                .filter(program -> normalizedSearch.isBlank() || matchesProgramSearch(program, normalizedSearch))
                .map(program -> toProgramSummary(program, recordsByProgram.getOrDefault(program.getId(), List.of()), progressByProgram.getOrDefault(program.getId(), List.of())))
                .toList();
    }
    
    public AdminCheckinProgramDetailResponse getProgram(Long id) {
        CheckinProgram program = findProgramEntity(id);
        List<CheckinProgramReward> rewards = rewardRepository.findByProgramIdOrderByDayNumberAsc(id);
        List<CheckinProgramLuckyDay> luckyDays = luckyDayRepository.findByProgramId(id).stream()
                .sorted(Comparator.comparing(CheckinProgramLuckyDay::getLuckyDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
        List<CheckinRecord> records = recordRepository.findByProgramId(id);
        List<UserCheckinProgress> progressList = progressRepository.findAll().stream()
                .filter(progress -> Objects.equals(progress.getProgramId(), id))
                .toList();

        List<Map<String, Object>> rewardRows = rewards.stream()
                .map(this::toRewardMap)
                .toList();
        List<Map<String, Object>> luckyDayRows = luckyDays.stream()
                .map(this::toLuckyDayMap)
                .toList();

        return new AdminCheckinProgramDetailResponse(
                toProgramSummary(program, records, progressList),
                rewardRows,
                luckyDayRows,
                buildProgramStats(records, progressList)
        );
    }
    
    public AdminCheckinProgramDetailResponse createProgram(AdminCheckinProgramPayload payload) {
        validateProgramPayload(payload, null);
        CheckinProgram program = new CheckinProgram();
        applyProgramPayload(program, payload, true);
        program.setCreatedAt(LocalDateTime.now());
        program.setUpdatedAt(LocalDateTime.now());
        program.setCreatedBy("admin");
        program.setUpdatedBy("admin");
        CheckinProgram savedProgram = programRepository.save(program);
        saveRewards(savedProgram.getId(), payload.getRewards());
        saveLuckyDays(savedProgram.getId(), payload.getLuckyDays());
        return getProgram(savedProgram.getId());
    }
    
    public AdminCheckinProgramDetailResponse updateProgram(Long id, AdminCheckinProgramPayload payload) {
        validateProgramPayload(payload, id);
        CheckinProgram existing = findProgramEntity(id);
        applyProgramPayload(existing, payload, false);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy("admin");
        programRepository.save(existing);
        saveRewards(id, payload.getRewards());
        saveLuckyDays(id, payload.getLuckyDays());
        return getProgram(id);
    }
    
    public void deleteProgram(Long id) {
        // Only delete if no checkin records exist
        List<CheckinRecord> records = recordRepository.findByProgramId(id);
        if (!records.isEmpty()) {
            throw new RuntimeException("Cannot delete program with existing check-in records. Please pause or end it instead.");
        }
        luckyDayRepository.deleteByProgramId(id);
        rewardRepository.deleteByProgramId(id);
        programRepository.deleteById(id);
    }
    
    public Map<String, Object> duplicateProgram(Long id) {
        CheckinProgram source = findProgramEntity(id);
        AdminCheckinProgramPayload payload = new AdminCheckinProgramPayload();
        payload.setCode(generateDuplicateCode(source.getCode()));
        payload.setName(source.getName() + " (Bản sao)");
        payload.setDescription(source.getDescription());
        payload.setImageUrl(source.getImageUrl());
        payload.setProgramType(source.getProgramType());
        payload.setTotalDays(source.getTotalDays());
        payload.setRequireConsecutive(source.getRequireConsecutive());
        payload.setResetOnMiss(source.getResetOnMiss());
        payload.setAllowRepeat(source.getAllowRepeat());
        payload.setRepeatType(source.getRepeatType());
        payload.setStartDate(source.getStartDate());
        payload.setEndDate(source.getEndDate());
        payload.setCheckinStartTime(source.getCheckinStartTime());
        payload.setCheckinEndTime(source.getCheckinEndTime());
        payload.setTimezone(source.getTimezone());
        payload.setStatus("DRAFT");
        payload.setHeroTitle(source.getHeroTitle());
        payload.setHeroDescription(source.getHeroDescription());
        payload.setButtonText(source.getButtonText());
        payload.setCheckedButtonText(source.getCheckedButtonText());
        payload.setConfettiEnabled(source.getConfettiEnabled());
        payload.setAnimationEnabled(source.getAnimationEnabled());

        List<AdminCheckinProgramPayload.RewardPayload> rewards = rewardRepository.findByProgramIdOrderByDayNumberAsc(id).stream()
                .map(reward -> {
                    AdminCheckinProgramPayload.RewardPayload item = new AdminCheckinProgramPayload.RewardPayload();
                    item.setDayNumber(reward.getDayNumber());
                    item.setRewardType(reward.getRewardType());
                    item.setRewardValue(reward.getRewardValue());
                    item.setVoucherId(reward.getVoucherId());
                    item.setProductId(reward.getProductId());
                    item.setDisplayName(reward.getDisplayName());
                    item.setDescription(reward.getDescription());
                    item.setIconUrl(reward.getIconUrl());
                    item.setStatus(reward.getStatus());
                    return item;
                })
                .toList();
        payload.setRewards(rewards);

        List<AdminCheckinProgramPayload.LuckyDayPayload> luckyDays = luckyDayRepository.findByProgramId(id).stream()
                .map(luckyDay -> {
                    AdminCheckinProgramPayload.LuckyDayPayload item = new AdminCheckinProgramPayload.LuckyDayPayload();
                    item.setLuckyDate(luckyDay.getLuckyDate());
                    item.setMultiplier(luckyDay.getMultiplier());
                    item.setBonusPoints(luckyDay.getBonusPoints());
                    item.setVoucherId(luckyDay.getVoucherId());
                    item.setQuantityLimit(luckyDay.getQuantityLimit());
                    item.setStatus(luckyDay.getStatus());
                    return item;
                })
                .toList();
        payload.setLuckyDays(luckyDays);

        AdminCheckinProgramDetailResponse duplicated = createProgram(payload);
        return duplicated.program();
    }
    
    public Map<String, Object> updateProgramStatus(Long id, String status) {
        CheckinProgram existing = findProgramEntity(id);
        String normalizedStatus = safeUpper(status);
        if (!ALLOWED_PROGRAM_STATUSES.contains(normalizedStatus)) {
            throw new RuntimeException("Unsupported program status: " + status);
        }
        existing.setStatus(normalizedStatus);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy("admin");
        CheckinProgram saved = programRepository.save(existing);
        return toProgramSummary(
                saved,
                recordRepository.findByProgramId(id),
                progressRepository.findAll().stream().filter(progress -> Objects.equals(progress.getProgramId(), id)).toList()
        );
    }

    // --- Rewards ---
    public List<CheckinProgramReward> getProgramRewards(Long programId) {
        return rewardRepository.findByProgramIdOrderByDayNumberAsc(programId);
    }
    
    public List<CheckinProgramReward> saveProgramRewards(Long programId, List<CheckinProgramReward> rewards) {
        rewardRepository.deleteByProgramId(programId);
        rewards.forEach(r -> r.setProgramId(programId));
        return rewardRepository.saveAll(rewards);
    }

    // --- Settings ---
    public CheckinSetting getSettings() {
        return settingRepository.findAll().stream().findFirst().orElse(new CheckinSetting());
    }
    
    public CheckinSetting saveSettings(CheckinSetting settings) {
        CheckinSetting existing = getSettings();
        if (existing.getId() != null) {
            settings.setId(existing.getId());
        }
        return settingRepository.save(settings);
    }

    // --- History ---
    public List<AdminCheckinHistoryItem> getAllHistory(String search, Long programId, String status, LocalDate fromDate, LocalDate toDate) {
        List<CheckinRecord> records = recordRepository.findAll().stream()
                .sorted(Comparator.comparing(CheckinRecord::getCheckinTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        Map<Long, CheckinProgram> programLookup = programRepository.findAll().stream()
                .collect(Collectors.toMap(CheckinProgram::getId, program -> program));
        Set<Long> userIds = records.stream().map(CheckinRecord::getUserId).collect(Collectors.toSet());
        Map<Long, UserServiceUser> userLookup = loadUserLookup(userIds);
        String normalizedSearch = normalizeSearch(search);
        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";

        return records.stream()
                .map(record -> toHistoryItem(record, programLookup.get(record.getProgramId()), userLookup.get(record.getUserId())))
                .filter(item -> programId == null || Objects.equals(item.programId(), programId))
                .filter(item -> normalizedStatus.isBlank() || "ALL".equals(normalizedStatus) || normalizedStatus.equals(safeUpper(item.status())))
                .filter(item -> fromDate == null || !item.businessDate().isBefore(fromDate))
                .filter(item -> toDate == null || !item.businessDate().isAfter(toDate))
                .filter(item -> matchesHistorySearch(item, normalizedSearch))
                .toList();
    }

    public void deleteHistoryRecord(Long id) {
        CheckinRecord record = recordRepository.findById(id).orElseThrow(() -> new RuntimeException("Record not found"));
        progressRepository.findByProgramIdAndUserId(record.getProgramId(), record.getUserId())
            .ifPresent(progress -> {
                progress.setCurrentDay(Math.max(0, record.getDayNumber() - 1));
                progress.setCurrentStreak(record.getStreakBefore());
                progress.setTotalCheckins(Math.max(0, progress.getTotalCheckins() - 1));
                if (record.getDayNumber() <= 1) {
                    progress.setLastCheckinDate(null);
                } else {
                    progress.setLastCheckinDate(record.getBusinessDate().minusDays(1));
                }
                progressRepository.save(progress);
            });
            
        // Rollback points if awarded
        if (record.getPointsAwarded() != null && record.getPointsAwarded() > 0) {
            loyaltyEngineService.subtractPointsFromCheckinRollback(record.getUserId(), record.getPointsAwarded(), id);
        }
            
        recordRepository.deleteById(id);
    }

    public byte[] exportHistoryCsv(String search, Long programId, String status, LocalDate fromDate, LocalDate toDate) {
        List<AdminCheckinHistoryItem> rows = getAllHistory(search, programId, status, fromDate, toDate);
        StringBuilder builder = new StringBuilder();
        builder.append('\uFEFF');
        builder.append("User ID,Tên người dùng,Email,Mã chương trình,Tên chương trình,Ngày điểm danh,Thời gian,Ngày thứ,Chuỗi,Điểm,Voucher,Trạng thái\n");
        for (AdminCheckinHistoryItem row : rows) {
            builder.append(csv(row.userId())).append(',')
                    .append(csv(row.userName())).append(',')
                    .append(csv(row.email())).append(',')
                    .append(csv(row.programCode())).append(',')
                    .append(csv(row.programName())).append(',')
                    .append(csv(row.businessDate())).append(',')
                    .append(csv(row.checkinTime())).append(',')
                    .append(csv(row.dayNumber())).append(',')
                    .append(csv(row.streakAfter())).append(',')
                    .append(csv(row.pointsAwarded())).append(',')
                    .append(csv(row.voucherId())).append(',')
                    .append(csv(row.status())).append('\n');
        }
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    // --- Dashboard ---
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        List<CheckinRecord> records = recordRepository.findAll();
        List<UserCheckinProgress> progressList = progressRepository.findAll();
        List<CheckinProgram> programs = programRepository.findAll();
        Map<Long, CheckinProgram> programLookup = programs.stream()
                .collect(Collectors.toMap(CheckinProgram::getId, program -> program));
        Map<Long, UserServiceUser> userLookup = loadUserLookup(records.stream().map(CheckinRecord::getUserId).collect(Collectors.toSet()));

        Map<String, Object> summary = new HashMap<>();
        LocalDate today = LocalDate.now();

        long todayCheckIns = records.stream()
                .filter(r -> r.getBusinessDate().equals(today))
                .count();
        summary.put("todayCheckIns", todayCheckIns);

        long totalUsers = records.stream().map(CheckinRecord::getUserId).distinct().count();
        summary.put("totalUsers", totalUsers);

        long totalPointsAwarded = records.stream()
                .mapToLong(record -> record.getPointsAwarded() != null ? record.getPointsAwarded() : 0)
                .sum();
        summary.put("totalPointsAwarded", totalPointsAwarded);

        long totalVouchersAwarded = records.stream()
                .filter(record -> record.getVoucherId() != null && !record.getVoucherId().isBlank())
                .count();
        summary.put("totalVouchersAwarded", totalVouchersAwarded);

        summary.put("activePrograms", programs.stream().filter(program -> "ACTIVE".equalsIgnoreCase(program.getStatus())).count());

        long highestStreak = progressList.stream()
            .mapToLong(UserCheckinProgress::getLongestStreak)
            .max().orElse(0);
        summary.put("highestStreak", highestStreak);

        response.put("summary", summary);

        List<Map<String, Object>> checkInTrend = new ArrayList<>();
        List<Map<String, Object>> pointsTrend = new ArrayList<>();
        List<Map<String, Object>> voucherTrend = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            List<CheckinRecord> recordsForDate = records.stream()
                    .filter(r -> r.getBusinessDate().equals(date))
                    .toList();
            long checkins = recordsForDate.size();

            Map<String, Object> trendItem = new HashMap<>();
            trendItem.put("date", date.format(formatter));
            trendItem.put("checkIns", checkins);
            checkInTrend.add(trendItem);

            Map<String, Object> pointsItem = new HashMap<>();
            pointsItem.put("date", date.format(formatter));
            pointsItem.put("points", recordsForDate.stream().mapToLong(record -> record.getPointsAwarded() != null ? record.getPointsAwarded() : 0).sum());
            pointsTrend.add(pointsItem);

            Map<String, Object> voucherItem = new HashMap<>();
            voucherItem.put("date", date.format(formatter));
            voucherItem.put("vouchers", recordsForDate.stream().filter(record -> record.getVoucherId() != null && !record.getVoucherId().isBlank()).count());
            voucherTrend.add(voucherItem);
        }

        response.put("checkInTrend", checkInTrend);
        response.put("pointsTrend", pointsTrend);
        response.put("voucherTrend", voucherTrend);

        Map<String, Object> rewardCycle = new HashMap<>();
        rewardCycle.put("sevenDayRate", totalUsers > 0 ? roundToOneDecimal(progressList.stream().filter(progress -> safeInt(progress.getCurrentStreak()) >= 7).count() * 100.0 / totalUsers) : 0.0);
        rewardCycle.put("thirtyDayRate", totalUsers > 0 ? roundToOneDecimal(progressList.stream().filter(progress -> safeInt(progress.getLongestStreak()) >= 30).count() * 100.0 / totalUsers) : 0.0);
        response.put("rewardCycleCompletion", rewardCycle);

        List<Map<String, Object>> recentActivities = records.stream()
                .sorted(Comparator.comparing(CheckinRecord::getCheckinTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(record -> {
                    UserServiceUser user = userLookup.get(record.getUserId());
                    CheckinProgram program = programLookup.get(record.getProgramId());
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", record.getId());
                    activity.put("userName", resolveDisplayName(user, record.getUserId()));
                    activity.put("programName", program != null ? program.getName() : "Chương trình");
                    activity.put("streakAfter", record.getStreakAfter());
                    activity.put("pointsAwarded", record.getPointsAwarded());
                    activity.put("voucherId", record.getVoucherId());
                    activity.put("checkinTime", record.getCheckinTime());
                    return activity;
                })
                .toList();
        response.put("recentActivities", recentActivities);

        return response;
    }

    private CheckinProgram findProgramEntity(Long id) {
        return programRepository.findById(id).orElseThrow(() -> new RuntimeException("Program not found"));
    }

    private boolean matchesProgramSearch(CheckinProgram program, String search) {
        return containsIgnoreCase(program.getCode(), search)
                || containsIgnoreCase(program.getName(), search)
                || containsIgnoreCase(program.getDescription(), search)
                || containsIgnoreCase(program.getProgramType(), search);
    }

    private Map<String, Object> toProgramSummary(CheckinProgram program, List<CheckinRecord> records, List<UserCheckinProgress> progressList) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", program.getId());
        row.put("code", program.getCode());
        row.put("name", program.getName());
        row.put("description", program.getDescription());
        row.put("imageUrl", program.getImageUrl());
        row.put("programType", safeText(program.getProgramType(), "CONSECUTIVE"));
        row.put("totalDays", safeInt(program.getTotalDays()));
        row.put("requireConsecutive", program.getRequireConsecutive());
        row.put("resetOnMiss", program.getResetOnMiss());
        row.put("allowRepeat", program.getAllowRepeat());
        row.put("repeatType", safeText(program.getRepeatType(), "NONE"));
        row.put("startDate", program.getStartDate());
        row.put("endDate", program.getEndDate());
        row.put("checkinStartTime", program.getCheckinStartTime());
        row.put("checkinEndTime", program.getCheckinEndTime());
        row.put("timezone", safeText(program.getTimezone(), "Asia/Ho_Chi_Minh"));
        row.put("status", safeText(program.getStatus(), "DRAFT"));
        row.put("heroTitle", program.getHeroTitle());
        row.put("heroDescription", program.getHeroDescription());
        row.put("buttonText", program.getButtonText());
        row.put("checkedButtonText", program.getCheckedButtonText());
        row.put("confettiEnabled", program.getConfettiEnabled());
        row.put("animationEnabled", program.getAnimationEnabled());
        row.put("participantCount", progressList.stream().map(UserCheckinProgress::getUserId).distinct().count());
        row.put("totalCheckins", records.size());
        row.put("totalPointsAwarded", records.stream().mapToLong(record -> record.getPointsAwarded() != null ? record.getPointsAwarded() : 0).sum());
        row.put("totalVouchersAwarded", records.stream().filter(record -> record.getVoucherId() != null && !record.getVoucherId().isBlank()).count());
        long completedUsers = progressList.stream().filter(progress -> Boolean.TRUE.equals(progress.getCompleted())).count();
        long participants = progressList.stream().map(UserCheckinProgress::getUserId).distinct().count();
        row.put("completionRate", participants > 0 ? roundToOneDecimal(completedUsers * 100.0 / participants) : 0.0);
        row.put("createdAt", program.getCreatedAt());
        row.put("updatedAt", program.getUpdatedAt());
        return row;
    }

    private Map<String, Object> buildProgramStats(List<CheckinRecord> records, List<UserCheckinProgress> progressList) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long participants = progressList.stream().map(UserCheckinProgress::getUserId).distinct().count();
        stats.put("participantCount", participants);
        stats.put("currentCheckinCount", records.size());
        stats.put("completionRate", participants > 0
                ? roundToOneDecimal(progressList.stream().filter(progress -> Boolean.TRUE.equals(progress.getCompleted())).count() * 100.0 / participants)
                : 0.0);
        stats.put("totalPointsAwarded", records.stream().mapToLong(record -> record.getPointsAwarded() != null ? record.getPointsAwarded() : 0).sum());
        stats.put("voucherAwardedCount", records.stream().filter(record -> record.getVoucherId() != null && !record.getVoucherId().isBlank()).count());
        return stats;
    }

    private Map<String, Object> toRewardMap(CheckinProgramReward reward) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", reward.getId());
        row.put("dayNumber", reward.getDayNumber());
        row.put("rewardType", reward.getRewardType());
        row.put("rewardValue", reward.getRewardValue());
        row.put("voucherId", reward.getVoucherId());
        row.put("productId", reward.getProductId());
        row.put("displayName", reward.getDisplayName());
        row.put("description", reward.getDescription());
        row.put("iconUrl", reward.getIconUrl());
        row.put("status", reward.getStatus());
        return row;
    }

    private Map<String, Object> toLuckyDayMap(CheckinProgramLuckyDay luckyDay) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", luckyDay.getId());
        row.put("luckyDate", luckyDay.getLuckyDate());
        row.put("multiplier", luckyDay.getMultiplier());
        row.put("bonusPoints", luckyDay.getBonusPoints());
        row.put("voucherId", luckyDay.getVoucherId());
        row.put("quantityLimit", luckyDay.getQuantityLimit());
        row.put("quantityUsed", luckyDay.getQuantityUsed());
        row.put("status", luckyDay.getStatus());
        return row;
    }

    private void validateProgramPayload(AdminCheckinProgramPayload payload, Long programId) {
        if (payload == null) {
            throw new RuntimeException("Program payload is required");
        }
        if (payload.getCode() == null || payload.getCode().isBlank()) {
            throw new RuntimeException("Program code is required");
        }
        if (payload.getName() == null || payload.getName().isBlank()) {
            throw new RuntimeException("Program name is required");
        }
        if (payload.getTotalDays() == null || payload.getTotalDays() <= 0) {
            throw new RuntimeException("Total days must be greater than 0");
        }
        if (payload.getStartDate() != null && payload.getEndDate() != null && payload.getEndDate().isBefore(payload.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        programRepository.findByCode(payload.getCode().trim())
                .filter(existing -> !Objects.equals(existing.getId(), programId))
                .ifPresent(existing -> {
                    throw new RuntimeException("Program code already exists");
                });
    }

    private void applyProgramPayload(CheckinProgram program, AdminCheckinProgramPayload payload, boolean creating) {
        program.setCode(payload.getCode().trim());
        program.setName(payload.getName().trim());
        program.setDescription(trimToNull(payload.getDescription()));
        program.setImageUrl(trimToNull(payload.getImageUrl()));
        program.setProgramType(safeText(payload.getProgramType(), "CONSECUTIVE"));
        program.setTotalDays(payload.getTotalDays());
        program.setRequireConsecutive(payload.getRequireConsecutive() != null ? payload.getRequireConsecutive() : Boolean.TRUE);
        program.setResetOnMiss(payload.getResetOnMiss() != null ? payload.getResetOnMiss() : Boolean.TRUE);
        program.setAllowRepeat(payload.getAllowRepeat() != null ? payload.getAllowRepeat() : Boolean.FALSE);
        program.setRepeatType(safeText(payload.getRepeatType(), "NONE"));
        program.setStartDate(payload.getStartDate());
        program.setEndDate(payload.getEndDate());
        program.setCheckinStartTime(payload.getCheckinStartTime());
        program.setCheckinEndTime(payload.getCheckinEndTime());
        program.setTimezone(safeText(payload.getTimezone(), "Asia/Ho_Chi_Minh"));
        String status = safeUpper(payload.getStatus());
        program.setStatus(ALLOWED_PROGRAM_STATUSES.contains(status) ? status : (creating ? "DRAFT" : safeText(program.getStatus(), "DRAFT")));
        program.setHeroTitle(trimToNull(payload.getHeroTitle()));
        program.setHeroDescription(trimToNull(payload.getHeroDescription()));
        program.setButtonText(trimToNull(payload.getButtonText()));
        program.setCheckedButtonText(trimToNull(payload.getCheckedButtonText()));
        program.setConfettiEnabled(payload.getConfettiEnabled() != null ? payload.getConfettiEnabled() : Boolean.TRUE);
        program.setAnimationEnabled(payload.getAnimationEnabled() != null ? payload.getAnimationEnabled() : Boolean.TRUE);
    }

    private void saveRewards(Long programId, List<AdminCheckinProgramPayload.RewardPayload> rewards) {
        rewardRepository.deleteByProgramId(programId);
        if (rewards == null || rewards.isEmpty()) {
            return;
        }

        List<CheckinProgramReward> entities = rewards.stream()
                .filter(reward -> reward.getDayNumber() != null && reward.getDayNumber() > 0)
                .map(reward -> {
                    CheckinProgramReward entity = new CheckinProgramReward();
                    entity.setProgramId(programId);
                    entity.setDayNumber(reward.getDayNumber());
                    entity.setRewardType(safeText(reward.getRewardType(), "NONE"));
                    entity.setRewardValue(trimToNull(reward.getRewardValue()));
                    entity.setVoucherId(trimToNull(reward.getVoucherId()));
                    entity.setProductId(trimToNull(reward.getProductId()));
                    entity.setDisplayName(trimToNull(reward.getDisplayName()));
                    entity.setDescription(trimToNull(reward.getDescription()));
                    entity.setIconUrl(trimToNull(reward.getIconUrl()));
                    entity.setStatus(safeText(reward.getStatus(), "ACTIVE"));
                    entity.setCreatedAt(LocalDateTime.now());
                    entity.setUpdatedAt(LocalDateTime.now());
                    return entity;
                })
                .sorted(Comparator.comparing(CheckinProgramReward::getDayNumber))
                .toList();

        if (!entities.isEmpty()) {
            rewardRepository.saveAll(entities);
        }
    }

    private void saveLuckyDays(Long programId, List<AdminCheckinProgramPayload.LuckyDayPayload> luckyDays) {
        luckyDayRepository.deleteByProgramId(programId);
        if (luckyDays == null || luckyDays.isEmpty()) {
            return;
        }

        List<CheckinProgramLuckyDay> entities = luckyDays.stream()
                .filter(luckyDay -> luckyDay.getLuckyDate() != null)
                .map(luckyDay -> {
                    CheckinProgramLuckyDay entity = new CheckinProgramLuckyDay();
                    entity.setProgramId(programId);
                    entity.setLuckyDate(luckyDay.getLuckyDate());
                    entity.setMultiplier(luckyDay.getMultiplier() != null ? luckyDay.getMultiplier() : BigDecimal.ONE);
                    entity.setBonusPoints(luckyDay.getBonusPoints() != null ? luckyDay.getBonusPoints() : 0);
                    entity.setVoucherId(trimToNull(luckyDay.getVoucherId()));
                    entity.setQuantityLimit(luckyDay.getQuantityLimit());
                    entity.setStatus(safeText(luckyDay.getStatus(), "ACTIVE"));
                    return entity;
                })
                .sorted(Comparator.comparing(CheckinProgramLuckyDay::getLuckyDate))
                .toList();

        if (!entities.isEmpty()) {
            luckyDayRepository.saveAll(entities);
        }
    }

    private AdminCheckinHistoryItem toHistoryItem(CheckinRecord record, CheckinProgram program, UserServiceUser user) {
        return new AdminCheckinHistoryItem(
                record.getId(),
                record.getProgramId(),
                program != null ? program.getCode() : "",
                program != null ? program.getName() : "",
                record.getUserId(),
                resolveDisplayName(user, record.getUserId()),
                resolveEmail(user),
                record.getBusinessDate(),
                record.getCheckinTime(),
                record.getDayNumber(),
                record.getStreakAfter(),
                record.getPointsAwarded(),
                record.getVoucherId(),
                record.getStatus()
        );
    }

    private boolean matchesHistorySearch(AdminCheckinHistoryItem item, String search) {
        if (search.isBlank()) {
            return true;
        }
        return containsIgnoreCase(item.userName(), search)
                || containsIgnoreCase(item.email(), search)
                || containsIgnoreCase(item.programCode(), search)
                || containsIgnoreCase(item.programName(), search)
                || containsIgnoreCase(String.valueOf(item.userId()), search);
    }

    private Map<Long, UserServiceUser> loadUserLookup(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        try {
            return userServiceClient.getAllUsers().stream()
                    .filter(user -> user.id() != null && userIds.contains(user.id()))
                    .collect(Collectors.toMap(UserServiceUser::id, user -> user));
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private String resolveDisplayName(UserServiceUser user, Long fallbackUserId) {
        if (user != null && user.userDetails() != null) {
            String firstName = user.userDetails().firstName() != null ? user.userDetails().firstName() : "";
            String lastName = user.userDetails().lastName() != null ? user.userDetails().lastName() : "";
            String fullName = (firstName + " " + lastName).trim();
            if (!fullName.isBlank()) {
                return fullName;
            }
        }
        if (user != null && user.userName() != null && !user.userName().isBlank()) {
            return user.userName();
        }
        return "User " + fallbackUserId;
    }

    private String resolveEmail(UserServiceUser user) {
        if (user != null && user.userDetails() != null && user.userDetails().email() != null) {
            return user.userDetails().email();
        }
        return "";
    }

    private String generateDuplicateCode(String sourceCode) {
        String base = (sourceCode == null || sourceCode.isBlank()) ? "CHECKIN_COPY" : sourceCode.trim() + "_COPY";
        String candidate = base;
        int suffix = 1;
        while (programRepository.findByCode(candidate).isPresent()) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    private String csv(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value).replace("\"", "\"\"");
        return "\"" + text + "\"";
    }

    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(search);
    }

    private String normalizeSearch(String search) {
        return search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
    }

    private String safeUpper(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
