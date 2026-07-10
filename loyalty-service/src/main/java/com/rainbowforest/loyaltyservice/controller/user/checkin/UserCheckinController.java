package com.rainbowforest.loyaltyservice.controller.user.checkin;

import com.rainbowforest.loyaltyservice.service.checkin.CheckinUserService;
import com.rainbowforest.loyaltyservice.domain.checkin.UserCheckinStreak;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/check-ins")
public class UserCheckinController {

    @Autowired
    private CheckinUserService userService;
    
    @GetMapping("/me/overview")
    public ResponseEntity<Map<String, Object>> getOverview(@RequestHeader("X-User-Id") Long userId) {
        Map<String, Object> overview = new HashMap<>();
        UserCheckinStreak streak = userService.getUserStreak(userId);
        overview.put("currentStreak", streak.getCurrentStreak());
        overview.put("bestStreak", streak.getBestStreak());
        overview.put("todayCheckedIn", userService.getTodayCheckin(userId).isPresent());
        return ResponseEntity.ok(overview);
    }
}
