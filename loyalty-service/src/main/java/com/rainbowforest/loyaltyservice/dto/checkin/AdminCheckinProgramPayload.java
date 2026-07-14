package com.rainbowforest.loyaltyservice.dto.checkin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class AdminCheckinProgramPayload {
    private String code;
    private String name;
    private String description;
    private String imageUrl;
    private String programType;
    private Integer totalDays;
    private Boolean requireConsecutive;
    private Boolean resetOnMiss;
    private Boolean allowRepeat;
    private String repeatType;
    private Integer dailyLimit;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime checkinStartTime;
    private LocalTime checkinEndTime;
    private String timezone;
    private String status;
    private String heroTitle;
    private String heroDescription;
    private String buttonText;
    private String checkedButtonText;
    private Boolean confettiEnabled;
    private Boolean animationEnabled;
    private List<RewardPayload> rewards = new ArrayList<>();
    private List<LuckyDayPayload> luckyDays = new ArrayList<>();

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getProgramType() {
        return programType;
    }

    public void setProgramType(String programType) {
        this.programType = programType;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public Boolean getRequireConsecutive() {
        return requireConsecutive;
    }

    public void setRequireConsecutive(Boolean requireConsecutive) {
        this.requireConsecutive = requireConsecutive;
    }

    public Boolean getResetOnMiss() {
        return resetOnMiss;
    }

    public void setResetOnMiss(Boolean resetOnMiss) {
        this.resetOnMiss = resetOnMiss;
    }

    public Boolean getAllowRepeat() {
        return allowRepeat;
    }

    public void setAllowRepeat(Boolean allowRepeat) {
        this.allowRepeat = allowRepeat;
    }

    public String getRepeatType() {
        return repeatType;
    }

    public void setRepeatType(String repeatType) {
        this.repeatType = repeatType;
    }

    public Integer getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(Integer dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalTime getCheckinStartTime() {
        return checkinStartTime;
    }

    public void setCheckinStartTime(LocalTime checkinStartTime) {
        this.checkinStartTime = checkinStartTime;
    }

    public LocalTime getCheckinEndTime() {
        return checkinEndTime;
    }

    public void setCheckinEndTime(LocalTime checkinEndTime) {
        this.checkinEndTime = checkinEndTime;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHeroTitle() {
        return heroTitle;
    }

    public void setHeroTitle(String heroTitle) {
        this.heroTitle = heroTitle;
    }

    public String getHeroDescription() {
        return heroDescription;
    }

    public void setHeroDescription(String heroDescription) {
        this.heroDescription = heroDescription;
    }

    public String getButtonText() {
        return buttonText;
    }

    public void setButtonText(String buttonText) {
        this.buttonText = buttonText;
    }

    public String getCheckedButtonText() {
        return checkedButtonText;
    }

    public void setCheckedButtonText(String checkedButtonText) {
        this.checkedButtonText = checkedButtonText;
    }

    public Boolean getConfettiEnabled() {
        return confettiEnabled;
    }

    public void setConfettiEnabled(Boolean confettiEnabled) {
        this.confettiEnabled = confettiEnabled;
    }

    public Boolean getAnimationEnabled() {
        return animationEnabled;
    }

    public void setAnimationEnabled(Boolean animationEnabled) {
        this.animationEnabled = animationEnabled;
    }

    public List<RewardPayload> getRewards() {
        return rewards;
    }

    public void setRewards(List<RewardPayload> rewards) {
        this.rewards = rewards;
    }

    public List<LuckyDayPayload> getLuckyDays() {
        return luckyDays;
    }

    public void setLuckyDays(List<LuckyDayPayload> luckyDays) {
        this.luckyDays = luckyDays;
    }

    public static class RewardPayload {
        private Long id;
        private Integer dayNumber;
        private String rewardType;
        private String rewardValue;
        private String voucherId;
        private String productId;
        private String displayName;
        private String description;
        private String iconUrl;
        private String status;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Integer getDayNumber() {
            return dayNumber;
        }

        public void setDayNumber(Integer dayNumber) {
            this.dayNumber = dayNumber;
        }

        public String getRewardType() {
            return rewardType;
        }

        public void setRewardType(String rewardType) {
            this.rewardType = rewardType;
        }

        public String getRewardValue() {
            return rewardValue;
        }

        public void setRewardValue(String rewardValue) {
            this.rewardValue = rewardValue;
        }

        public String getVoucherId() {
            return voucherId;
        }

        public void setVoucherId(String voucherId) {
            this.voucherId = voucherId;
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getIconUrl() {
            return iconUrl;
        }

        public void setIconUrl(String iconUrl) {
            this.iconUrl = iconUrl;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class LuckyDayPayload {
        private Long id;
        private LocalDate luckyDate;
        private BigDecimal multiplier;
        private Integer bonusPoints;
        private String voucherId;
        private Integer quantityLimit;
        private String status;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public LocalDate getLuckyDate() {
            return luckyDate;
        }

        public void setLuckyDate(LocalDate luckyDate) {
            this.luckyDate = luckyDate;
        }

        public BigDecimal getMultiplier() {
            return multiplier;
        }

        public void setMultiplier(BigDecimal multiplier) {
            this.multiplier = multiplier;
        }

        public Integer getBonusPoints() {
            return bonusPoints;
        }

        public void setBonusPoints(Integer bonusPoints) {
            this.bonusPoints = bonusPoints;
        }

        public String getVoucherId() {
            return voucherId;
        }

        public void setVoucherId(String voucherId) {
            this.voucherId = voucherId;
        }

        public Integer getQuantityLimit() {
            return quantityLimit;
        }

        public void setQuantityLimit(Integer quantityLimit) {
            this.quantityLimit = quantityLimit;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
