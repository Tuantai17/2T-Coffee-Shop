package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_records", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "business_date"})})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "business_date")
    private LocalDate businessDate;
    private LocalDateTime checkinTime;
    private Integer streakBefore;
    private Integer streakAfter;
    private Integer pointsEarned;
    private String voucherEarned;
    private Boolean isLuckyDay;
    private String status;
    private String transactionId;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
