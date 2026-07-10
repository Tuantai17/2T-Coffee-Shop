package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_checkin_achievements", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "achievement_id"})})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCheckinAchievement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "achievement_id")
    private Long achievementId;
    private Integer currentProgress;
    private Boolean isUnlocked;
    private LocalDateTime unlockedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
