package com.rainbowforest.notificationservice.service;

import com.rainbowforest.notificationservice.domain.Notification;
import com.rainbowforest.notificationservice.repository.NotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailSenderService.class);

    private final JavaMailSender javaMailSender;
    
    @Autowired
    private EmailTemplateService emailTemplateService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from-name:2T Coffee Shop}")
    private String fromName;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailSenderService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public boolean isMailEnabled() {
        return mailEnabled;
    }

    @Async
    public void sendNotificationEmailAsync(String notificationId, String to, Notification notification) {
        if (!mailEnabled || to == null || to.isBlank()) {
            updateNotificationStatus(notificationId, "SKIPPED");
            return;
        }

        try {
            String templateName = determineTemplate(notification.getType());
            Map<String, Object> variables = new HashMap<>(notification.getMetadata() != null ? notification.getMetadata() : new HashMap<>());
            variables.put("title", notification.getTitle());
            variables.put("message", notification.getMessage());
            variables.put("actionUrl", notification.getActionUrl());
            
            String htmlContent = emailTemplateService.generateEmail(templateName, variables);
            sendHtmlEmail(to, notification.getTitle(), htmlContent);
            
            updateNotificationStatus(notificationId, "SENT");
        } catch (Exception e) {
            log.error("Failed to send email for notification {}", notificationId, e);
            updateNotificationStatusFailed(notificationId);
        }
    }

    private void updateNotificationStatus(String notificationId, String status) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setEmailStatus(status);
            if ("SENT".equals(status)) {
                n.setEmailSentAt(LocalDateTime.now());
            }
            notificationRepository.save(n);
        });
    }
    
    private void updateNotificationStatusFailed(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setEmailStatus("FAILED");
            n.setEmailRetryCount(n.getEmailRetryCount() + 1);
            notificationRepository.save(n);
        });
    }

    private String determineTemplate(String eventType) {
        return switch (eventType) {
            case "ORDER_CREATED" -> "order-created";
            case "ORDER_STATUS_CHANGED" -> "order-status-changed";
            case "SUPPORT_MESSAGE" -> "support-message";
            case "CONTACT_CREATED" -> "contact-created";
            case "CHECKIN_REMINDER" -> "checkin-reminder";
            default -> "default-template";
        };
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

        helper.setFrom(String.format("%s <%s>", fromName, fromEmail));
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true indicates HTML content

        javaMailSender.send(message);
        log.info("Successfully sent email to: {}", to);
    }
}
