package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_audit_logs")
@Data
public class CheckinAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String adminId;

    @Column(nullable = false)
    private String action;

    private String entityType;
    private String entityId;
    
    @Column(columnDefinition = "jsonb")
    private String oldValue;
    
    @Column(columnDefinition = "jsonb")
    private String newValue;
    
    private String reason;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    public void setReason(String reason) { this.reason = reason; }
    public String getReason() { return reason; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public String getNewValue() { return newValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getOldValue() { return oldValue; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getEntityId() { return entityId; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityType() { return entityType; }
    public void setAction(String action) { this.action = action; }
    public String getAction() { return action; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    public String getAdminId() { return adminId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class CheckinAuditLogBuilder {
        private Long id;
        private String adminId;
        private String action;
        private String entityType;
        private String entityId;
        private String oldValue;
        private String newValue;
        private String reason;

        public CheckinAuditLogBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CheckinAuditLogBuilder adminId(String adminId) {
            this.adminId = adminId;
            return this;
        }

        public CheckinAuditLogBuilder action(String action) {
            this.action = action;
            return this;
        }

        public CheckinAuditLogBuilder entityType(String entityType) {
            this.entityType = entityType;
            return this;
        }

        public CheckinAuditLogBuilder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public CheckinAuditLogBuilder oldValue(String oldValue) {
            this.oldValue = oldValue;
            return this;
        }

        public CheckinAuditLogBuilder newValue(String newValue) {
            this.newValue = newValue;
            return this;
        }

        public CheckinAuditLogBuilder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public CheckinAuditLog build() {
            CheckinAuditLog obj = new CheckinAuditLog();
            obj.setId(this.id);
            obj.setAdminId(this.adminId);
            obj.setAction(this.action);
            obj.setEntityType(this.entityType);
            obj.setEntityId(this.entityId);
            obj.setOldValue(this.oldValue);
            obj.setNewValue(this.newValue);
            obj.setReason(this.reason);
            return obj;
        }
    }
    
    public static CheckinAuditLogBuilder builder() { return new CheckinAuditLogBuilder(); }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
