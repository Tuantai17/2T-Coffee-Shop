package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "checkin_calendar_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinCalendarEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_date")
    private LocalDate eventDate;
    private String type;
    private String status;
    private Integer basePoints;
    private BigDecimal multiplier;
    private Integer bonusPoints;
    private String voucherId;
    private Long rewardId;
    private Integer quantityLimit;
    private LocalTime startTime;
    private LocalTime endTime;
    private String displayText;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
