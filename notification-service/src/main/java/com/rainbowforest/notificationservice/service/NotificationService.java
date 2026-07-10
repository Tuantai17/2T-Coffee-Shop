package com.rainbowforest.notificationservice.service;

import com.rainbowforest.notificationservice.domain.EmailDeliveryLog;
import com.rainbowforest.notificationservice.domain.Notification;
import com.rainbowforest.notificationservice.repository.EmailDeliveryLogRepository;
import com.rainbowforest.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailDeliveryLogRepository emailDeliveryLogRepository;

    @Autowired
    private EmailProvider emailProvider;

    public Notification createAndSendNotification(Long userId, String userEmail, String type, String title, String message, String refType, String refId) {
        // 1. Create In-App Notification
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceType(refType);
        notification.setReferenceId(refId);
        notification.setDeliveryChannels(List.of("IN_APP", "EMAIL"));
        
        notification = notificationRepository.save(notification);

        // 2. Send Email
        EmailDeliveryLog emailLog = new EmailDeliveryLog();
        emailLog.setMessageId(notification.getId());
        emailLog.setUserId(userId);
        emailLog.setTemplateCode(type);
        emailLog.setProvider(emailProvider.getProviderName());
        
        if (userEmail != null && !userEmail.isBlank()) {
            try {
                emailProvider.sendEmail(userEmail, title, message);
                emailLog.setStatus("SUCCESS");
                notification.setDeliveryStatus("COMPLETED");
            } catch (Exception e) {
                emailLog.setStatus("FAILED");
                emailLog.setErrorMessage(e.getMessage());
                notification.setDeliveryStatus("FAILED");
                emailDeliveryLogRepository.save(emailLog);
                notificationRepository.save(notification);
                
                // Throw exception so Kafka Consumer will retry and eventually DLT
                throw new RuntimeException("Email delivery failed", e);
            }
        } else {
            emailLog.setStatus("SKIPPED_NO_EMAIL");
            notification.setDeliveryStatus("COMPLETED");
        }
        
        emailDeliveryLogRepository.save(emailLog);
        notificationRepository.save(notification);
        
        return notification;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String id) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().filter(n -> !n.isRead()).toList();
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
