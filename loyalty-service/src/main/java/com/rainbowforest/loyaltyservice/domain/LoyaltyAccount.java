package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "available_points", nullable = false)
    private Long availablePoints;

    @Column(name = "pending_points", nullable = false)
    private Long pendingPoints;

    @Column(name = "reserved_points", nullable = false)
    private Long reservedPoints;

    @Column(name = "lifetime_earned_points", nullable = false)
    private Long lifetimeEarnedPoints;

    @Column(name = "lifetime_used_points", nullable = false)
    private Long lifetimeUsedPoints;

    @Column(name = "current_tier_code", nullable = false)
    private String currentTierCode;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (availablePoints == null) availablePoints = 0L;
        if (pendingPoints == null) pendingPoints = 0L;
        if (reservedPoints == null) reservedPoints = 0L;
        if (lifetimeEarnedPoints == null) lifetimeEarnedPoints = 0L;
        if (lifetimeUsedPoints == null) lifetimeUsedPoints = 0L;
        if (currentTierCode == null) currentTierCode = "MEMBER";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setVersion(Long version) { this.version = version; }
    public Long getVersion() { return version; }
    public void setCurrentTierCode(String currentTierCode) { this.currentTierCode = currentTierCode; }
    public String getCurrentTierCode() { return currentTierCode; }
    public void setLifetimeUsedPoints(Long lifetimeUsedPoints) { this.lifetimeUsedPoints = lifetimeUsedPoints; }
    public Long getLifetimeUsedPoints() { return lifetimeUsedPoints; }
    public void setLifetimeEarnedPoints(Long lifetimeEarnedPoints) { this.lifetimeEarnedPoints = lifetimeEarnedPoints; }
    public Long getLifetimeEarnedPoints() { return lifetimeEarnedPoints; }
    public void setReservedPoints(Long reservedPoints) { this.reservedPoints = reservedPoints; }
    public Long getReservedPoints() { return reservedPoints; }
    public void setPendingPoints(Long pendingPoints) { this.pendingPoints = pendingPoints; }
    public Long getPendingPoints() { return pendingPoints; }
    public void setAvailablePoints(Long availablePoints) { this.availablePoints = availablePoints; }
    public Long getAvailablePoints() { return availablePoints; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class LoyaltyAccountBuilder {
        private Long id;
        private Long userId;
        private Long availablePoints;
        private Long pendingPoints;
        private Long reservedPoints;
        private Long lifetimeEarnedPoints;
        private Long lifetimeUsedPoints;
        private String currentTierCode;
        private Long version;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public LoyaltyAccountBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public LoyaltyAccountBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public LoyaltyAccountBuilder availablePoints(Long availablePoints) {
            this.availablePoints = availablePoints;
            return this;
        }

        public LoyaltyAccountBuilder pendingPoints(Long pendingPoints) {
            this.pendingPoints = pendingPoints;
            return this;
        }

        public LoyaltyAccountBuilder reservedPoints(Long reservedPoints) {
            this.reservedPoints = reservedPoints;
            return this;
        }

        public LoyaltyAccountBuilder lifetimeEarnedPoints(Long lifetimeEarnedPoints) {
            this.lifetimeEarnedPoints = lifetimeEarnedPoints;
            return this;
        }

        public LoyaltyAccountBuilder lifetimeUsedPoints(Long lifetimeUsedPoints) {
            this.lifetimeUsedPoints = lifetimeUsedPoints;
            return this;
        }

        public LoyaltyAccountBuilder currentTierCode(String currentTierCode) {
            this.currentTierCode = currentTierCode;
            return this;
        }

        public LoyaltyAccountBuilder version(Long version) {
            this.version = version;
            return this;
        }

        public LoyaltyAccountBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public LoyaltyAccountBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public LoyaltyAccount build() {
            LoyaltyAccount obj = new LoyaltyAccount();
            obj.setId(this.id);
            obj.setUserId(this.userId);
            obj.setAvailablePoints(this.availablePoints);
            obj.setPendingPoints(this.pendingPoints);
            obj.setReservedPoints(this.reservedPoints);
            obj.setLifetimeEarnedPoints(this.lifetimeEarnedPoints);
            obj.setLifetimeUsedPoints(this.lifetimeUsedPoints);
            obj.setCurrentTierCode(this.currentTierCode);
            obj.setVersion(this.version);
            obj.setCreatedAt(this.createdAt);
            obj.setUpdatedAt(this.updatedAt);
            return obj;
        }
    }
    
    public static LoyaltyAccountBuilder builder() { return new LoyaltyAccountBuilder(); }
}
