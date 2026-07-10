package com.rainbowforest.loyaltyservice.controller;

import com.rainbowforest.loyaltyservice.service.ReservationEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loyalty/points")
public class LoyaltyReservationController {

    @Autowired
    private ReservationEngineService reservationEngineService;

    @PostMapping("/checkout-preview")
    public ResponseEntity<?> previewPoints(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                           @RequestBody Map<String, Object> payload) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        
        long orderTotal = getLongValue(payload.get("orderTotal"));
        long maxPoints = reservationEngineService.previewPoints(userId, orderTotal);

        return ResponseEntity.ok(Map.of("maxPointsToUse", maxPoints));
    }

    @PostMapping("/reserve")
    public ResponseEntity<?> reservePoints(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                           @RequestBody Map<String, Object> payload) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);

        String orderId = (String) payload.get("orderId");
        long pointsToReserve = getLongValue(payload.get("points"));

        try {
            reservationEngineService.reservePoints(userId, orderId, pointsToReserve);
            return ResponseEntity.ok(Map.of("message", "Points reserved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/commit")
    public ResponseEntity<?> commitPoints(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                          @RequestBody Map<String, Object> payload) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        String orderId = (String) payload.get("orderId");

        try {
            reservationEngineService.commitPoints(userId, orderId);
            return ResponseEntity.ok(Map.of("message", "Points committed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/release")
    public ResponseEntity<?> releasePoints(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                           @RequestBody Map<String, Object> payload) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        String orderId = (String) payload.get("orderId");

        try {
            reservationEngineService.releasePoints(userId, orderId);
            return ResponseEntity.ok(Map.of("message", "Points released successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private long getLongValue(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
