package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "processed_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true, length = 100)
    private String eventId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "processed_at", nullable = false, updatable = false)
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        processedAt = LocalDateTime.now();
    }

    public void setEventId(String eventId) { this.eventId = eventId; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public void setStatus(String status) { this.status = status; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public String getStatus() { return status; }
    public String getReferenceId() { return referenceId; }
    public String getEventType() { return eventType; }
    public String getEventId() { return eventId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class ProcessedEventBuilder {
        private Long id;
        private String eventId;
        private String eventType;
        private String referenceId;
        private String status;
        private LocalDateTime processedAt;

        public ProcessedEventBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ProcessedEventBuilder eventId(String eventId) {
            this.eventId = eventId;
            return this;
        }

        public ProcessedEventBuilder eventType(String eventType) {
            this.eventType = eventType;
            return this;
        }

        public ProcessedEventBuilder referenceId(String referenceId) {
            this.referenceId = referenceId;
            return this;
        }

        public ProcessedEventBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ProcessedEventBuilder processedAt(LocalDateTime processedAt) {
            this.processedAt = processedAt;
            return this;
        }

        public ProcessedEvent build() {
            ProcessedEvent obj = new ProcessedEvent();
            obj.setId(this.id);
            obj.setEventId(this.eventId);
            obj.setEventType(this.eventType);
            obj.setReferenceId(this.referenceId);
            obj.setStatus(this.status);
            obj.setProcessedAt(this.processedAt);
            return obj;
        }
    }
    
    public static ProcessedEventBuilder builder() { return new ProcessedEventBuilder(); }
}
