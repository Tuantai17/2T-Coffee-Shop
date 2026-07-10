package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "checkin_reward_cycles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinRewardCycle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Integer days;
    private String cycleType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isRepeatable;
    private Integer totalParticipants;
    private BigDecimal completionRate;
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
