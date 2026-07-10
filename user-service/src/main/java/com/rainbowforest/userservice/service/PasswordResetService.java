package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.dto.PasswordResetSendOtpResult;

public interface PasswordResetService {
    PasswordResetSendOtpResult sendOtp(String email);
    String verifyOtp(String email, String otpCode);
    void resetPassword(String email, String resetToken, String newPassword);
}
