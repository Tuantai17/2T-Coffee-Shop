package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_checkin_progress")
@Data
public class UserCheckinProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long programId;

    @Column(nullable = false)
    private Long userId;

    private Integer currentDay = 0;
    private Integer currentStreak = 0;
    private Integer longestStreak = 0;
    private Integer totalCheckins = 0;
    
    private LocalDate lastCheckinDate;
    
    private Boolean completed = false;
    private LocalDateTime completedAt;
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setLastCheckinDate(LocalDate lastCheckinDate) { this.lastCheckinDate = lastCheckinDate; }
    public LocalDate getLastCheckinDate() { return lastCheckinDate; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getProgramId() { return programId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class UserCheckinProgressBuilder {
        private Long id;
        private Long programId;
        private Long userId;
        private LocalDate lastCheckinDate;
        private LocalDateTime completedAt;

        public UserCheckinProgressBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserCheckinProgressBuilder programId(Long programId) {
            this.programId = programId;
            return this;
        }

        public UserCheckinProgressBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public UserCheckinProgressBuilder lastCheckinDate(LocalDate lastCheckinDate) {
            this.lastCheckinDate = lastCheckinDate;
            return this;
        }

        public UserCheckinProgressBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public UserCheckinProgress build() {
            UserCheckinProgress obj = new UserCheckinProgress();
            obj.setId(this.id);
            obj.setProgramId(this.programId);
            obj.setUserId(this.userId);
            obj.setLastCheckinDate(this.lastCheckinDate);
            obj.setCompletedAt(this.completedAt);
            return obj;
        }
    }
    
    public static UserCheckinProgressBuilder builder() { return new UserCheckinProgressBuilder(); }
    public Integer getCurrentDay() { return this.currentDay; }
    public void setCurrentDay(Integer currentDay) { this.currentDay = currentDay; }
    public Integer getCurrentStreak() { return this.currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    public Integer getLongestStreak() { return this.longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    public Integer getTotalCheckins() { return this.totalCheckins; }
    public void setTotalCheckins(Integer totalCheckins) { this.totalCheckins = totalCheckins; }
    public Boolean getCompleted() { return this.completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
