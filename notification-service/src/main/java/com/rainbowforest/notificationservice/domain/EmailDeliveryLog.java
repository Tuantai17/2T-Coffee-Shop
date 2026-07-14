package com.rainbowforest.notificationservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "email_notifications")
public class EmailDeliveryLog {
    @Id
    private String id;
    
    private String eventId;
    
    @Indexed(unique = true)
    private String idempotencyKey;
    
    private String eventType;
    private String recipientEmail;
    private String recipientName;
    private String subject;
    private String templateCode;
    
    private Long userId;
    private Long orderId;
    private String orderCode;
    
    private String status; // PENDING, SENT, FAILED, RETRYING, SKIPPED
    private int retryCount;
    private int maxRetries;
    private String lastError;
    private String providerMessageId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime sentAt;

    public EmailDeliveryLog() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.retryCount = 0;
        this.maxRetries = 3;
        this.status = "PENDING";
    }
}
