package com.rainbowforest.notificationservice.service;

import com.rainbowforest.notificationservice.domain.Notification;
import com.rainbowforest.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailSenderService emailSenderService;

    public Notification createAndSendNotification(
            String eventId, String idempotencyKey, String recipientId, String recipientRole,
            String type, String category, String title, String message,
            String actionUrl, String referenceId, Map<String, Object> metadata,
            boolean emailRequired, String recipientEmail) {
            
        // Check idempotency
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            if (notificationRepository.existsByIdempotencyKeyAndRecipientId(idempotencyKey, recipientId)) {
                return null; // Already processed
            }
        } else if (eventId != null && !eventId.isBlank()) {
            if (notificationRepository.existsByEventIdAndRecipientId(eventId, recipientId)) {
                return null; // Already processed
            }
        }

        Notification notification = new Notification();
        notification.setEventId(eventId);
        notification.setIdempotencyKey(idempotencyKey);
        notification.setRecipientId(recipientId);
        notification.setRecipientRole(recipientRole);
        notification.setType(type);
        notification.setCategory(category);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setReferenceId(referenceId);
        notification.setMetadata(metadata);
        notification.setEmailRequired(emailRequired);
        
        notification = notificationRepository.save(notification);

        // Send Real-time STOMP Message
        sendRealTimeUpdate(recipientId, recipientRole);

        // Send Email Async
        if (emailRequired && recipientEmail != null && !recipientEmail.isBlank()) {
            emailSenderService.sendNotificationEmailAsync(notification.getId(), recipientEmail, notification);
        }

        return notification;
    }

    private void sendRealTimeUpdate(String recipientId, String recipientRole) {
        Long unreadCount = notificationRepository.countByRecipientIdAndRecipientRoleAndIsReadFalse(recipientId, recipientRole);
        // Assuming user id is the recipient ID for USER role, and some admin topic for ADMIN role
        if ("USER".equalsIgnoreCase(recipientRole)) {
            messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                Map.of("unreadCount", unreadCount, "event", "NEW_NOTIFICATION")
            );
        } else if ("ADMIN".equalsIgnoreCase(recipientRole)) {
            messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                Map.of("unreadCount", unreadCount, "event", "NEW_NOTIFICATION")
            );
        }
    }

    public Page<Notification> getNotifications(String recipientId, String recipientRole, String category, Boolean unreadOnly, Pageable pageable) {
        if (category != null && !category.isBlank()) {
            if (Boolean.TRUE.equals(unreadOnly)) {
                return notificationRepository.findByRecipientIdAndRecipientRoleAndCategoryAndIsReadOrderByCreatedAtDesc(recipientId, recipientRole, category, false, pageable);
            }
            return notificationRepository.findByRecipientIdAndRecipientRoleAndCategoryOrderByCreatedAtDesc(recipientId, recipientRole, category, pageable);
        } else {
            if (Boolean.TRUE.equals(unreadOnly)) {
                return notificationRepository.findByRecipientIdAndRecipientRoleAndIsReadOrderByCreatedAtDesc(recipientId, recipientRole, false, pageable);
            }
            return notificationRepository.findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(recipientId, recipientRole, pageable);
        }
    }

    public List<Notification> getLatestNotifications(String recipientId, String recipientRole) {
        return notificationRepository.findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(
                recipientId, recipientRole, org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
    }

    public void markAsRead(String id, String recipientId, String recipientRole) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            if (n.getRecipientId().equals(recipientId) && n.getRecipientRole().equals(recipientRole)) {
                n.setRead(true);
                n.setReadAt(LocalDateTime.now());
                n.setUpdatedAt(LocalDateTime.now());
                notificationRepository.save(n);
                sendRealTimeUpdate(recipientId, recipientRole);
            }
        }
    }

    public void markAllAsRead(String recipientId, String recipientRole) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndRecipientRoleAndIsReadFalse(recipientId, recipientRole);
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            n.setUpdatedAt(LocalDateTime.now());
        }
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
            sendRealTimeUpdate(recipientId, recipientRole);
        }
    }

    public Long getUnreadCount(String recipientId, String recipientRole) {
        return notificationRepository.countByRecipientIdAndRecipientRoleAndIsReadFalse(recipientId, recipientRole);
    }
}
