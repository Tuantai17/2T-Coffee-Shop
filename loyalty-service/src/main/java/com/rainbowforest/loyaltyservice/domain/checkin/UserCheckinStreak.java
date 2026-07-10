package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_checkin_streaks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCheckinStreak {
    @Id
    @Column(name = "user_id")
    private Long userId;
    private Integer currentStreak;
    private Integer bestStreak;
    private Integer totalCheckins;
    private Integer totalPoints;
    private Integer totalVouchers;
    private LocalDate lastCheckinDate;
    @Version
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
