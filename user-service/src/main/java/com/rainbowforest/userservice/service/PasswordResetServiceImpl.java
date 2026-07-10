package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.dto.PasswordResetSendOtpResult;
import com.rainbowforest.userservice.entity.PasswordResetOtp;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.repository.PasswordResetOtpRepository;
import com.rainbowforest.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final int otpExpirationMinutes;
    private final int resetTokenExpirationMinutes;
    private final boolean exposeDevOtp;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            PasswordResetOtpRepository passwordResetOtpRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.password-reset.otp-expiration-minutes:5}") int otpExpirationMinutes,
            @Value("${app.password-reset.reset-token-expiration-minutes:10}") int resetTokenExpirationMinutes,
            @Value("${app.password-reset.expose-dev-otp:true}") boolean exposeDevOtp
    ) {
        this.userRepository = userRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.otpExpirationMinutes = otpExpirationMinutes;
        this.resetTokenExpirationMinutes = resetTokenExpirationMinutes;
        this.exposeDevOtp = exposeDevOtp;
    }

    @Override
    public PasswordResetSendOtpResult sendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByUserDetailsEmail(normalizedEmail);
        if (user == null) {
            return new PasswordResetSendOtpResult(
                    "Neu email ton tai trong he thong, ma OTP da duoc gui.",
                    null,
                    emailService.isConfigured()
            );
        }

        invalidatePendingOtps(normalizedEmail);

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(normalizedEmail);
        resetOtp.setOtpCode(generateOtpCode());
        resetOtp.setVerified(false);
        resetOtp.setUsed(false);
        resetOtp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));

        passwordResetOtpRepository.save(resetOtp);

        boolean deliveredByEmail = false;
        String message = "Neu email ton tai trong he thong, ma OTP da duoc gui.";
        try {
            emailService.sendPasswordResetOtp(normalizedEmail, resetOtp.getOtpCode(), otpExpirationMinutes);
            deliveredByEmail = emailService.isConfigured();
        } catch (IllegalStateException ex) {
            if (!exposeDevOtp) {
                throw ex;
            }
            message = "Khong gui duoc email OTP. He thong da chuyen sang ma OTP test local.";
        }

        String devOtp = (!deliveredByEmail && exposeDevOtp) ? resetOtp.getOtpCode() : null;
        return new PasswordResetSendOtpResult(message, devOtp, deliveredByEmail);
    }

    @Override
    public String verifyOtp(String email, String otpCode) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedOtp = normalizeOtp(otpCode);

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(normalizedEmail, normalizedOtp)
                .orElseThrow(() -> new IllegalArgumentException("OTP khong hop le."));

        if (resetOtp.isVerified()) {
            if (resetOtp.getResetToken() != null
                    && resetOtp.getResetTokenExpiresAt() != null
                    && resetOtp.getResetTokenExpiresAt().isAfter(LocalDateTime.now())) {
                return resetOtp.getResetToken();
            }
            throw new IllegalArgumentException("OTP da duoc xac thuc truoc do. Vui long gui lai ma moi.");
        }

        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP da het han. Vui long gui lai ma moi.");
        }

        resetOtp.setVerified(true);
        resetOtp.setVerifiedAt(LocalDateTime.now());
        resetOtp.setResetToken(UUID.randomUUID().toString());
        resetOtp.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(resetTokenExpirationMinutes));
        passwordResetOtpRepository.save(resetOtp);

        return resetOtp.getResetToken();
    }

    @Override
    public void resetPassword(String email, String resetToken, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedResetToken = normalizeResetToken(resetToken);
        validatePassword(newPassword);

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay yeu cau dat lai mat khau."));

        if (!resetOtp.isVerified()) {
            throw new IllegalArgumentException("OTP chua duoc xac thuc.");
        }
        if (resetOtp.getResetToken() == null || !resetOtp.getResetToken().equals(normalizedResetToken)) {
            throw new IllegalArgumentException("Phien dat lai mat khau khong hop le.");
        }
        if (resetOtp.getResetTokenExpiresAt() == null || resetOtp.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Phien dat lai mat khau da het han. Vui long thuc hien lai.");
        }

        User user = userRepository.findByUserDetailsEmail(normalizedEmail);
        if (user == null) {
            throw new IllegalArgumentException("Tai khoan khong ton tai.");
        }

        user.setUserPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        resetOtp.setUsed(true);
        passwordResetOtpRepository.save(resetOtp);
    }

    private void invalidatePendingOtps(String email) {
        List<PasswordResetOtp> existingRequests = passwordResetOtpRepository.findByEmailAndUsedFalse(email);
        if (existingRequests.isEmpty()) {
            return;
        }

        for (PasswordResetOtp request : existingRequests) {
            request.setUsed(true);
        }
        passwordResetOtpRepository.saveAll(existingRequests);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email khong duoc de trong.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOtp(String otpCode) {
        if (otpCode == null || otpCode.isBlank()) {
            throw new IllegalArgumentException("OTP khong duoc de trong.");
        }
        String normalizedOtp = otpCode.trim();
        if (!normalizedOtp.matches("\\d{6}")) {
            throw new IllegalArgumentException("OTP phai gom 6 chu so.");
        }
        return normalizedOtp;
    }

    private String normalizeResetToken(String resetToken) {
        if (resetToken == null || resetToken.isBlank()) {
            throw new IllegalArgumentException("Thieu reset token.");
        }
        return resetToken.trim();
    }

    private void validatePassword(String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Mat khau moi khong duoc de trong.");
        }
        String normalizedPassword = newPassword.trim();
        if (normalizedPassword.length() < 6) {
            throw new IllegalArgumentException("Mat khau moi phai co it nhat 6 ky tu.");
        }
        if (normalizedPassword.length() > 100) {
            throw new IllegalArgumentException("Mat khau moi qua dai.");
        }
    }

    private String generateOtpCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }
}
