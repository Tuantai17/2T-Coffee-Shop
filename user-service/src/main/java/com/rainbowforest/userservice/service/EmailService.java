package com.rainbowforest.userservice.service;

public interface EmailService {
    boolean isConfigured();
    void sendPasswordResetOtp(String email, String otpCode, int expirationMinutes);
}
