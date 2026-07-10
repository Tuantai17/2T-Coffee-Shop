package com.rainbowforest.loyaltyservice.controller;

import com.rainbowforest.loyaltyservice.service.CheckinEngineService;
import com.rainbowforest.loyaltyservice.service.MinigameEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loyalty/engagement")
public class LoyaltyEngagementController {

    @Autowired
    private CheckinEngineService checkinEngineService;

    @Autowired
    private MinigameEngineService minigameEngineService;

    @PostMapping("/checkin")
    public ResponseEntity<?> dailyCheckin(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);

        try {
            long earnedPoints = checkinEngineService.processCheckin(userId);
            return ResponseEntity.ok(Map.of("message", "Checked in successfully", "earnedPoints", earnedPoints));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/lucky-wheel/spin")
    public ResponseEntity<?> spinLuckyWheel(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);

        try {
            long earnedPoints = minigameEngineService.spinLuckyWheel(userId);
            return ResponseEntity.ok(Map.of(
                    "message", earnedPoints > 0 ? "Congratulations!" : "Better luck next time!",
                    "earnedPoints", earnedPoints
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
