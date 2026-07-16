package com.rainbowforest.notificationservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
@CompoundIndexes({
    @CompoundIndex(name = "idx_event_recipient", def = "{'eventId': 1, 'recipientId': 1}", unique = true),
    @CompoundIndex(name = "idx_idempotency_recipient", def = "{'idempotencyKey': 1, 'recipientId': 1}", unique = true),
    @CompoundIndex(name = "idx_query_recipient_role_created", def = "{'recipientId': 1, 'recipientRole': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_query_recipient_unread", def = "{'recipientId': 1, 'isRead': 1}")
})
public class Notification {
    @Id
    private String id;
    
    private String eventId;
    private String idempotencyKey;
    
    private String recipientId; // String format for flexibility (can store Long as String)
    private String recipientRole; // USER, ADMIN
    
    private String type;
    private String category; // ORDER, CHECKIN, SUPPORT, CONTACT
    
    private String title;
    private String message;
    
    private String actionUrl;
    private String referenceId;
    
    private Map<String, Object> metadata;
    
    private boolean isRead;
    private LocalDateTime readAt;
    
    private boolean emailRequired;
    private String emailStatus; // PENDING, SENT, FAILED
    private LocalDateTime emailSentAt;
    private int emailRetryCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isRead = false;
        this.emailStatus = "PENDING";
        this.emailRetryCount = 0;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { this.isRead = read; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    
    public boolean isEmailRequired() { return emailRequired; }
    public void setEmailRequired(boolean emailRequired) { this.emailRequired = emailRequired; }

    public String getEmailStatus() { return emailStatus; }
    public void setEmailStatus(String emailStatus) { this.emailStatus = emailStatus; }

    public LocalDateTime getEmailSentAt() { return emailSentAt; }
    public void setEmailSentAt(LocalDateTime emailSentAt) { this.emailSentAt = emailSentAt; }

    public int getEmailRetryCount() { return emailRetryCount; }
    public void setEmailRetryCount(int emailRetryCount) { this.emailRetryCount = emailRetryCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
