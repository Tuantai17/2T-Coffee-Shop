package com.rainbowforest.loyaltyservice.controller.user.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.*;
import com.rainbowforest.loyaltyservice.service.checkin.CheckinUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/check-ins")
public class UserCheckinController {

    @Autowired
    private CheckinUserService userService;

    private Long extractUserId(String header) {
        try {
            return header != null ? Long.parseLong(header) : 1L;
        } catch (NumberFormatException e) {
            return 1L; // Fallback
        }
    }

    @GetMapping("/me/overview")
    public ResponseEntity<?> getOverview(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        
        CheckinProgram activeProgram = userService.getActiveProgram();
        if (activeProgram == null) {
            return ResponseEntity.ok(Map.of("hasActiveProgram", false));
        }

        UserCheckinProgress progress = userService.getUserProgress(activeProgram.getId(), userId);
        Optional<CheckinRecord> todayCheckin = userService.getTodayCheckin(activeProgram.getId(), userId);
        List<CheckinProgramReward> rewards = userService.getProgramRewards(activeProgram.getId());
        List<CheckinProgramLuckyDay> luckyDays = userService.getProgramLuckyDays(activeProgram.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("hasActiveProgram", true);
        response.put("program", activeProgram);
        response.put("progress", progress);
        response.put("checkedInToday", todayCheckin.isPresent());
        response.put("currentStreak", progress.getCurrentStreak());
        response.put("totalCheckins", progress.getTotalCheckins());
        response.put("rewards", rewards);
        response.put("luckyDays", luckyDays);
        response.put("history", userService.getUserHistory(activeProgram.getId(), userId));
        
        // Find next reward
        int nextDay = progress.getCurrentDay() + 1;
        if (todayCheckin.isPresent()) {
            nextDay = progress.getCurrentDay(); // Currently checked in day
        }
        if (nextDay > activeProgram.getTotalDays()) nextDay = 1;
        
        for (CheckinProgramReward r : rewards) {
            if (r.getDayNumber() == nextDay) {
                response.put("nextRewardType", r.getRewardType());
                response.put("nextRewardValue", r.getRewardValue());
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/history")
    public ResponseEntity<?> getHistory(
            @RequestParam int year, 
            @RequestParam int month,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        CheckinProgram activeProgram = userService.getActiveProgram();
        if (activeProgram == null) {
            return ResponseEntity.ok(List.of());
        }
        List<CheckinRecord> history = userService.getHistory(activeProgram.getId(), userId, year, month);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/me/programs/{programId}/check-in")
    public ResponseEntity<?> performCheckin(
            @PathVariable Long programId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        try {
            CheckinRecord record = userService.performCheckin(userId, programId);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Null pointer"));
        }
    }
}
