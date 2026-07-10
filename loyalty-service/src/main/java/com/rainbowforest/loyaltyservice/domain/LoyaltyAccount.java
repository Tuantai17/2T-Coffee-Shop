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
}
