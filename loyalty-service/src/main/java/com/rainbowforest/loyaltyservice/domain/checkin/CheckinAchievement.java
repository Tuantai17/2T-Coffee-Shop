package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_achievements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinAchievement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String badgeColor;
    private String conditionType;
    private Integer targetValue;
    private Integer rewardPoints;
    private String rewardVoucherId;
    private Boolean showProgress;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalAchieved;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
