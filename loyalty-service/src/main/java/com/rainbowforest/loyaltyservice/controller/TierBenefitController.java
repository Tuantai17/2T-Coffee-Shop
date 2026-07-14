package com.rainbowforest.loyaltyservice.controller;

import com.rainbowforest.loyaltyservice.service.TierBenefitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
public class TierBenefitController {

    @Autowired
    private TierBenefitService tierBenefitService;

    private Long extractUserId(String header) {
        try {
            return header != null ? Long.parseLong(header) : 1L;
        } catch (NumberFormatException e) {
            return 1L; // Fallback
        }
    }

    @PostMapping("/me/claim-benefits")
    public ResponseEntity<?> claimBenefits(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        try {
            tierBenefitService.claimMonthlyBenefits(userId);
            return ResponseEntity.ok(Map.of("message", "Nhận quyền lợi thành công", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
        }
    }

    @GetMapping("/me/claim-status")
    public ResponseEntity<?> getClaimStatus(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = extractUserId(userIdHeader);
        boolean claimed = tierBenefitService.checkClaimedThisMonth(userId);
        return ResponseEntity.ok(Map.of("claimedThisMonth", claimed));
    }
}
