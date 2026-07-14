package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_program_rewards")
@Data
public class CheckinProgramReward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long programId;

    @Column(nullable = false)
    private Integer dayNumber;

    @Column(nullable = false)
    private String rewardType;

    private String rewardValue;
    private String voucherId;
    private String productId;
    
    private String displayName;
    private String description;
    private String iconUrl;
    
    private String status = "ACTIVE";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public String getIconUrl() { return iconUrl; }
    public void setDescription(String description) { this.description = description; }
    public String getDescription() { return description; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getDisplayName() { return displayName; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductId() { return productId; }
    public void setVoucherId(String voucherId) { this.voucherId = voucherId; }
    public String getVoucherId() { return voucherId; }
    public void setRewardValue(String rewardValue) { this.rewardValue = rewardValue; }
    public String getRewardValue() { return rewardValue; }
    public void setRewardType(String rewardType) { this.rewardType = rewardType; }
    public String getRewardType() { return rewardType; }
    public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
    public Integer getDayNumber() { return dayNumber; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getProgramId() { return programId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class CheckinProgramRewardBuilder {
        private Long id;
        private Long programId;
        private Integer dayNumber;
        private String rewardType;
        private String rewardValue;
        private String voucherId;
        private String productId;
        private String displayName;
        private String description;
        private String iconUrl;

        public CheckinProgramRewardBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CheckinProgramRewardBuilder programId(Long programId) {
            this.programId = programId;
            return this;
        }

        public CheckinProgramRewardBuilder dayNumber(Integer dayNumber) {
            this.dayNumber = dayNumber;
            return this;
        }

        public CheckinProgramRewardBuilder rewardType(String rewardType) {
            this.rewardType = rewardType;
            return this;
        }

        public CheckinProgramRewardBuilder rewardValue(String rewardValue) {
            this.rewardValue = rewardValue;
            return this;
        }

        public CheckinProgramRewardBuilder voucherId(String voucherId) {
            this.voucherId = voucherId;
            return this;
        }

        public CheckinProgramRewardBuilder productId(String productId) {
            this.productId = productId;
            return this;
        }

        public CheckinProgramRewardBuilder displayName(String displayName) {
            this.displayName = displayName;
            return this;
        }

        public CheckinProgramRewardBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CheckinProgramRewardBuilder iconUrl(String iconUrl) {
            this.iconUrl = iconUrl;
            return this;
        }

        public CheckinProgramReward build() {
            CheckinProgramReward obj = new CheckinProgramReward();
            obj.setId(this.id);
            obj.setProgramId(this.programId);
            obj.setDayNumber(this.dayNumber);
            obj.setRewardType(this.rewardType);
            obj.setRewardValue(this.rewardValue);
            obj.setVoucherId(this.voucherId);
            obj.setProductId(this.productId);
            obj.setDisplayName(this.displayName);
            obj.setDescription(this.description);
            obj.setIconUrl(this.iconUrl);
            return obj;
        }
    }
    
    public static CheckinProgramRewardBuilder builder() { return new CheckinProgramRewardBuilder(); }
    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
