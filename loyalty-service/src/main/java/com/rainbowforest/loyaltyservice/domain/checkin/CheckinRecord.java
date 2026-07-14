package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_records")
@Data
public class CheckinRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long programId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate businessDate;

    @Column(nullable = false)
    private LocalDateTime checkinTime;

    @Column(nullable = false)
    private Integer dayNumber;

    @Column(nullable = false)
    private Integer streakBefore;

    @Column(nullable = false)
    private Integer streakAfter;

    private Integer pointsAwarded = 0;
    private String voucherId;
    
    @Column(nullable = false)
    private String status; // SUCCESS, FAILED, DUPLICATE

    private String idempotencyKey;

    private LocalDateTime createdAt = LocalDateTime.now();
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setStatus(String status) { this.status = status; }
    public String getStatus() { return status; }
    public void setVoucherId(String voucherId) { this.voucherId = voucherId; }
    public String getVoucherId() { return voucherId; }
    public void setStreakAfter(Integer streakAfter) { this.streakAfter = streakAfter; }
    public Integer getStreakAfter() { return streakAfter; }
    public void setStreakBefore(Integer streakBefore) { this.streakBefore = streakBefore; }
    public Integer getStreakBefore() { return streakBefore; }
    public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
    public Integer getDayNumber() { return dayNumber; }
    public void setCheckinTime(LocalDateTime checkinTime) { this.checkinTime = checkinTime; }
    public LocalDateTime getCheckinTime() { return checkinTime; }
    public void setBusinessDate(LocalDate businessDate) { this.businessDate = businessDate; }
    public LocalDate getBusinessDate() { return businessDate; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getProgramId() { return programId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class CheckinRecordBuilder {
        private Long id;
        private Long programId;
        private Long userId;
        private LocalDate businessDate;
        private LocalDateTime checkinTime;
        private Integer dayNumber;
        private Integer streakBefore;
        private Integer streakAfter;
        private String voucherId;
        private String status;
        private String idempotencyKey;

        public CheckinRecordBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CheckinRecordBuilder programId(Long programId) {
            this.programId = programId;
            return this;
        }

        public CheckinRecordBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public CheckinRecordBuilder businessDate(LocalDate businessDate) {
            this.businessDate = businessDate;
            return this;
        }

        public CheckinRecordBuilder checkinTime(LocalDateTime checkinTime) {
            this.checkinTime = checkinTime;
            return this;
        }

        public CheckinRecordBuilder dayNumber(Integer dayNumber) {
            this.dayNumber = dayNumber;
            return this;
        }

        public CheckinRecordBuilder streakBefore(Integer streakBefore) {
            this.streakBefore = streakBefore;
            return this;
        }

        public CheckinRecordBuilder streakAfter(Integer streakAfter) {
            this.streakAfter = streakAfter;
            return this;
        }

        public CheckinRecordBuilder voucherId(String voucherId) {
            this.voucherId = voucherId;
            return this;
        }

        public CheckinRecordBuilder status(String status) {
            this.status = status;
            return this;
        }

        public CheckinRecordBuilder idempotencyKey(String idempotencyKey) {
            this.idempotencyKey = idempotencyKey;
            return this;
        }

        public CheckinRecord build() {
            CheckinRecord obj = new CheckinRecord();
            obj.setId(this.id);
            obj.setProgramId(this.programId);
            obj.setUserId(this.userId);
            obj.setBusinessDate(this.businessDate);
            obj.setCheckinTime(this.checkinTime);
            obj.setDayNumber(this.dayNumber);
            obj.setStreakBefore(this.streakBefore);
            obj.setStreakAfter(this.streakAfter);
            obj.setVoucherId(this.voucherId);
            obj.setStatus(this.status);
            obj.setIdempotencyKey(this.idempotencyKey);
            return obj;
        }
    }
    
    public static CheckinRecordBuilder builder() { return new CheckinRecordBuilder(); }
    public Integer getPointsAwarded() { return this.pointsAwarded; }
    public void setPointsAwarded(Integer pointsAwarded) { this.pointsAwarded = pointsAwarded; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
