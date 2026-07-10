package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_missions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinMission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String eventType;
    private Integer targetValue;
    private String cycle;
    private Integer rewardPoints;
    private String rewardVoucherId;
    private Integer displayOrder;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalCompleted;
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
