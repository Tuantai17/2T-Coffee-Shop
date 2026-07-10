package com.rainbowforest.userservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String mailUsername;
    private final String senderName;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${app.password-reset.sender-name:CoffeeShop}") String senderName
    ) {
        this.mailSender = mailSender;
        this.mailUsername = mailUsername;
        this.senderName = senderName;
    }

    @Override
    public boolean isConfigured() {
        return mailUsername != null && !mailUsername.isBlank();
    }

    @Override
    public void sendPasswordResetOtp(String email, String otpCode, int expirationMinutes) {
        if (!isConfigured()) {
            log.warn("Mail chưa được cấu hình. OTP cho email {} là {}", email, otpCode);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom(mailUsername);
        message.setSubject(senderName + " - Ma OTP dat lai mat khau");
        message.setText(buildOtpMessage(otpCode, expirationMinutes));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Không gửi được email OTP tới {}. OTP là {}", email, otpCode, ex);
            throw new IllegalStateException("Khong the gui email OTP. Vui long thu lai sau.");
        }
    }

    private String buildOtpMessage(String otpCode, int expirationMinutes) {
        return "Xin chao,\n\n"
                + "Ban vua yeu cau dat lai mat khau cho tai khoan CoffeeShop.\n"
                + "Ma OTP cua ban la: " + otpCode + "\n"
                + "Ma co hieu luc trong " + expirationMinutes + " phut.\n\n"
                + "Neu ban khong thuc hien yeu cau nay, vui long bo qua email nay.\n";
    }
}
