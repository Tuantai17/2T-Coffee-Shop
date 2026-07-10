package com.rainbowforest.userservice.dto;

public class PasswordResetSendOtpResult {

    private final String message;
    private final String otpCode;
    private final boolean deliveredByEmail;

    public PasswordResetSendOtpResult(String message, String otpCode, boolean deliveredByEmail) {
        this.message = message;
        this.otpCode = otpCode;
        this.deliveredByEmail = deliveredByEmail;
    }

    public String getMessage() {
        return message;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public boolean isDeliveredByEmail() {
        return deliveredByEmail;
    }
}
