package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "checkin_settings")
@Data
public class CheckinSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean enabled = true;
    private String timezone = "Asia/Ho_Chi_Minh";
    
    private Boolean allowStreakRestore = false;
    private Integer maxRestorePerMonth = 0;
    private Integer rateLimit = 1;
    
    private Boolean reminderEnabled = false;
    private LocalTime reminderTime;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }
    public LocalTime getReminderTime() { return reminderTime; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class CheckinSettingBuilder {
        private Long id;
        private LocalTime reminderTime;

        public CheckinSettingBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CheckinSettingBuilder reminderTime(LocalTime reminderTime) {
            this.reminderTime = reminderTime;
            return this;
        }

        public CheckinSetting build() {
            CheckinSetting obj = new CheckinSetting();
            obj.setId(this.id);
            obj.setReminderTime(this.reminderTime);
            return obj;
        }
    }
    
    public static CheckinSettingBuilder builder() { return new CheckinSettingBuilder(); }
    public Boolean getEnabled() { return this.enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public String getTimezone() { return this.timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public Boolean getAllowStreakRestore() { return this.allowStreakRestore; }
    public void setAllowStreakRestore(Boolean allowStreakRestore) { this.allowStreakRestore = allowStreakRestore; }
    public Integer getMaxRestorePerMonth() { return this.maxRestorePerMonth; }
    public void setMaxRestorePerMonth(Integer maxRestorePerMonth) { this.maxRestorePerMonth = maxRestorePerMonth; }
    public Integer getRateLimit() { return this.rateLimit; }
    public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }
    public Boolean getReminderEnabled() { return this.reminderEnabled; }
    public void setReminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
