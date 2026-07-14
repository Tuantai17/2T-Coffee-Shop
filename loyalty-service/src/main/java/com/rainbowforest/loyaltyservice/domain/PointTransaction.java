package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "point_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 80)
    private String transactionCode;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "type", nullable = false, length = 30)
    private String type; // EARN, SPEND, RESERVE, RELEASE, REVERSE, EXPIRE, ADJUST

    @Column(name = "source", nullable = false, length = 30)
    private String source; // ORDER, CHECKIN, MINIGAME, BIRTHDAY, MEMBER_DAY, UPGRADE_REWARD, ADMIN_ADJUSTMENT

    @Column(nullable = false)
    private Long points;

    @Column(name = "balance_before", nullable = false)
    private Long balanceBefore;

    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter;

    @Column(name = "reference_type", length = 30)
    private String referenceType;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(length = 500)
    private String description;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setDescription(String description) { this.description = description; }
    public String getDescription() { return description; }
    public void setStatus(String status) { this.status = status; }
    public String getStatus() { return status; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public String getReferenceType() { return referenceType; }
    public void setBalanceAfter(Long balanceAfter) { this.balanceAfter = balanceAfter; }
    public Long getBalanceAfter() { return balanceAfter; }
    public void setBalanceBefore(Long balanceBefore) { this.balanceBefore = balanceBefore; }
    public Long getBalanceBefore() { return balanceBefore; }
    public void setPoints(Long points) { this.points = points; }
    public Long getPoints() { return points; }
    public void setSource(String source) { this.source = source; }
    public String getSource() { return source; }
    public void setType(String type) { this.type = type; }
    public String getType() { return type; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }
    public String getTransactionCode() { return transactionCode; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class PointTransactionBuilder {
        private Long id;
        private String transactionCode;
        private Long userId;
        private String type;
        private String source;
        private Long points;
        private Long balanceBefore;
        private Long balanceAfter;
        private String referenceType;
        private String referenceId;
        private String status;
        private String description;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;

        public PointTransactionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PointTransactionBuilder transactionCode(String transactionCode) {
            this.transactionCode = transactionCode;
            return this;
        }

        public PointTransactionBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public PointTransactionBuilder type(String type) {
            this.type = type;
            return this;
        }

        public PointTransactionBuilder source(String source) {
            this.source = source;
            return this;
        }

        public PointTransactionBuilder points(Long points) {
            this.points = points;
            return this;
        }

        public PointTransactionBuilder balanceBefore(Long balanceBefore) {
            this.balanceBefore = balanceBefore;
            return this;
        }

        public PointTransactionBuilder balanceAfter(Long balanceAfter) {
            this.balanceAfter = balanceAfter;
            return this;
        }

        public PointTransactionBuilder referenceType(String referenceType) {
            this.referenceType = referenceType;
            return this;
        }

        public PointTransactionBuilder referenceId(String referenceId) {
            this.referenceId = referenceId;
            return this;
        }

        public PointTransactionBuilder status(String status) {
            this.status = status;
            return this;
        }

        public PointTransactionBuilder description(String description) {
            this.description = description;
            return this;
        }

        public PointTransactionBuilder expiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public PointTransactionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PointTransaction build() {
            PointTransaction obj = new PointTransaction();
            obj.setId(this.id);
            obj.setTransactionCode(this.transactionCode);
            obj.setUserId(this.userId);
            obj.setType(this.type);
            obj.setSource(this.source);
            obj.setPoints(this.points);
            obj.setBalanceBefore(this.balanceBefore);
            obj.setBalanceAfter(this.balanceAfter);
            obj.setReferenceType(this.referenceType);
            obj.setReferenceId(this.referenceId);
            obj.setStatus(this.status);
            obj.setDescription(this.description);
            obj.setExpiresAt(this.expiresAt);
            obj.setCreatedAt(this.createdAt);
            return obj;
        }
    }
    
    public static PointTransactionBuilder builder() { return new PointTransactionBuilder(); }
}
