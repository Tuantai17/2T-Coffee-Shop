package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.ForgotPasswordDtos.ResetPasswordRequest;
import com.rainbowforest.userservice.dto.ForgotPasswordDtos.SendOtpRequest;
import com.rainbowforest.userservice.dto.ForgotPasswordDtos.VerifyOtpRequest;
import com.rainbowforest.userservice.dto.PasswordResetSendOtpResult;
import com.rainbowforest.userservice.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/forgot-password")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody SendOtpRequest request) {
        PasswordResetSendOtpResult result = passwordResetService.sendOtp(request.getEmail());

        Map<String, Object> body = new HashMap<>();
        body.put("message", result.getMessage());
        body.put("deliveredByEmail", result.isDeliveredByEmail());
        if (result.getOtpCode() != null) {
            body.put("devOtp", result.getOtpCode());
        }
        return ResponseEntity.ok(body);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String resetToken = passwordResetService.verifyOtp(request.getEmail(), request.getOtp());

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Xac thuc OTP thanh cong.");
        body.put("resetToken", resetToken);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(
                request.getEmail(),
                request.getResetToken(),
                request.getNewPassword()
        );

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Dat lai mat khau thanh cong.");
        return ResponseEntity.ok(body);
    }
}
