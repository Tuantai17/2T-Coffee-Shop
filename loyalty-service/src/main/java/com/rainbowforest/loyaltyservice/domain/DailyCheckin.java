package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_checkins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "streak_count", nullable = false)
    private Integer streakCount;

    @Column(name = "reward_type", nullable = false, length = 30)
    private String rewardType;

    @Column(name = "reward_value", nullable = false, length = 50)
    private String rewardValue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setRewardValue(String rewardValue) { this.rewardValue = rewardValue; }
    public String getRewardValue() { return rewardValue; }
    public void setRewardType(String rewardType) { this.rewardType = rewardType; }
    public String getRewardType() { return rewardType; }
    public void setStreakCount(Integer streakCount) { this.streakCount = streakCount; }
    public Integer getStreakCount() { return streakCount; }
    public void setCheckinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; }
    public LocalDate getCheckinDate() { return checkinDate; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class DailyCheckinBuilder {
        private Long id;
        private Long userId;
        private LocalDate checkinDate;
        private Integer streakCount;
        private String rewardType;
        private String rewardValue;
        private LocalDateTime createdAt;

        public DailyCheckinBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public DailyCheckinBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public DailyCheckinBuilder checkinDate(LocalDate checkinDate) {
            this.checkinDate = checkinDate;
            return this;
        }

        public DailyCheckinBuilder streakCount(Integer streakCount) {
            this.streakCount = streakCount;
            return this;
        }

        public DailyCheckinBuilder rewardType(String rewardType) {
            this.rewardType = rewardType;
            return this;
        }

        public DailyCheckinBuilder rewardValue(String rewardValue) {
            this.rewardValue = rewardValue;
            return this;
        }

        public DailyCheckinBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public DailyCheckin build() {
            DailyCheckin obj = new DailyCheckin();
            obj.setId(this.id);
            obj.setUserId(this.userId);
            obj.setCheckinDate(this.checkinDate);
            obj.setStreakCount(this.streakCount);
            obj.setRewardType(this.rewardType);
            obj.setRewardValue(this.rewardValue);
            obj.setCreatedAt(this.createdAt);
            return obj;
        }
    }
    
    public static DailyCheckinBuilder builder() { return new DailyCheckinBuilder(); }
}
