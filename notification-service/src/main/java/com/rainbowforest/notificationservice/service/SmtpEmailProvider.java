package com.rainbowforest.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailProvider implements EmailProvider {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) throws Exception {
        if (mailSender == null) {
            System.out.println("JavaMailSender is not configured. Mocking email send to: " + to);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("noreply@coffeeshop.com");
        
        mailSender.send(message);
    }

    @Override
    public String getProviderName() {
        return "SMTP";
    }
}
