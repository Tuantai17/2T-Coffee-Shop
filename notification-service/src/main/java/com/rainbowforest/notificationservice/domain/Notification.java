package com.rainbowforest.notificationservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private String referenceType;
    private String referenceId;
    private boolean read;
    private List<String> deliveryChannels;
    private String deliveryStatus;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.read = false;
        this.deliveryStatus = "PENDING";
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public List<String> getDeliveryChannels() { return deliveryChannels; }
    public void setDeliveryChannels(List<String> deliveryChannels) { this.deliveryChannels = deliveryChannels; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
