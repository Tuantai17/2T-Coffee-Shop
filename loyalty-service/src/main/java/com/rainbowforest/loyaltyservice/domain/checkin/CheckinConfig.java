package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_configs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinConfig {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
    private String timezone;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxCheckinsPerDay;
    private Integer basePoints;
    private Boolean resetOnMiss;
    private Boolean allowRecovery;
    private Integer maxRecoveryPerMonth;
    private Integer recoveryFee;
    private Integer recoveryDays;
    private String cycleType;
    private String heroTitle;
    private String heroDesc;
    private String heroImage;
    private String checkinButtonText;
    private String afterCheckinText;
    private Boolean enableConfetti;
    private Boolean enableAnimation;
    private Boolean enableLuckyDay;
    private Boolean enableMysteryBox;
    private Boolean enableMission;
    private Boolean enableAchievement;
    private Boolean enableLeaderboard;
    private Boolean enableRewardStore;
    @Version
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
