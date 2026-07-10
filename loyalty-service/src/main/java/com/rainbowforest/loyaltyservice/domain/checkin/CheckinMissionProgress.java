package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_mission_progress")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinMissionProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "mission_id")
    private Long missionId;
    @Column(name = "user_id")
    private Long userId;
    private Integer currentValue;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    @Column(name = "business_date")
    private LocalDate businessDate;
    @Version
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
