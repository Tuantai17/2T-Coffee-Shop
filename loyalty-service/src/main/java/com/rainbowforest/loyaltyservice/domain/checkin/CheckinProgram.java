package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_programs")
@Data
public class CheckinProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;
    private String imageUrl;

    private String programType = "CONSECUTIVE";

    @Column(nullable = false)
    private Integer totalDays;

    private Boolean requireConsecutive = true;
    private Boolean resetOnMiss = true;
    private Boolean allowRepeat = false;
    private String repeatType = "NONE";

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalTime checkinStartTime;
    private LocalTime checkinEndTime;

    private String timezone = "Asia/Ho_Chi_Minh";
    private String status = "DRAFT";

    private String heroTitle;
    private String heroDescription;
    private String buttonText;
    private String checkedButtonText;

    private Boolean confettiEnabled = true;
    private Boolean animationEnabled = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private String createdBy;
    private String updatedBy;
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getCreatedBy() { return createdBy; }
    public void setCheckedButtonText(String checkedButtonText) { this.checkedButtonText = checkedButtonText; }
    public String getCheckedButtonText() { return checkedButtonText; }
    public void setButtonText(String buttonText) { this.buttonText = buttonText; }
    public String getButtonText() { return buttonText; }
    public void setHeroDescription(String heroDescription) { this.heroDescription = heroDescription; }
    public String getHeroDescription() { return heroDescription; }
    public void setHeroTitle(String heroTitle) { this.heroTitle = heroTitle; }
    public String getHeroTitle() { return heroTitle; }
    public void setCheckinEndTime(LocalTime checkinEndTime) { this.checkinEndTime = checkinEndTime; }
    public LocalTime getCheckinEndTime() { return checkinEndTime; }
    public void setCheckinStartTime(LocalTime checkinStartTime) { this.checkinStartTime = checkinStartTime; }
    public LocalTime getCheckinStartTime() { return checkinStartTime; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getStartDate() { return startDate; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }
    public Integer getTotalDays() { return totalDays; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getImageUrl() { return imageUrl; }
    public void setDescription(String description) { this.description = description; }
    public String getDescription() { return description; }
    public void setName(String name) { this.name = name; }
    public String getName() { return name; }
    public void setCode(String code) { this.code = code; }
    public String getCode() { return code; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class CheckinProgramBuilder {
        private Long id;
        private String code;
        private String name;
        private String description;
        private String imageUrl;
        private Integer totalDays;
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalTime checkinStartTime;
        private LocalTime checkinEndTime;
        private String heroTitle;
        private String heroDescription;
        private String buttonText;
        private String checkedButtonText;
        private String createdBy;
        private String updatedBy;

        public CheckinProgramBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CheckinProgramBuilder code(String code) {
            this.code = code;
            return this;
        }

        public CheckinProgramBuilder name(String name) {
            this.name = name;
            return this;
        }

        public CheckinProgramBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CheckinProgramBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public CheckinProgramBuilder totalDays(Integer totalDays) {
            this.totalDays = totalDays;
            return this;
        }

        public CheckinProgramBuilder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public CheckinProgramBuilder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public CheckinProgramBuilder checkinStartTime(LocalTime checkinStartTime) {
            this.checkinStartTime = checkinStartTime;
            return this;
        }

        public CheckinProgramBuilder checkinEndTime(LocalTime checkinEndTime) {
            this.checkinEndTime = checkinEndTime;
            return this;
        }

        public CheckinProgramBuilder heroTitle(String heroTitle) {
            this.heroTitle = heroTitle;
            return this;
        }

        public CheckinProgramBuilder heroDescription(String heroDescription) {
            this.heroDescription = heroDescription;
            return this;
        }

        public CheckinProgramBuilder buttonText(String buttonText) {
            this.buttonText = buttonText;
            return this;
        }

        public CheckinProgramBuilder checkedButtonText(String checkedButtonText) {
            this.checkedButtonText = checkedButtonText;
            return this;
        }

        public CheckinProgramBuilder createdBy(String createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public CheckinProgramBuilder updatedBy(String updatedBy) {
            this.updatedBy = updatedBy;
            return this;
        }

        public CheckinProgram build() {
            CheckinProgram obj = new CheckinProgram();
            obj.setId(this.id);
            obj.setCode(this.code);
            obj.setName(this.name);
            obj.setDescription(this.description);
            obj.setImageUrl(this.imageUrl);
            obj.setTotalDays(this.totalDays);
            obj.setStartDate(this.startDate);
            obj.setEndDate(this.endDate);
            obj.setCheckinStartTime(this.checkinStartTime);
            obj.setCheckinEndTime(this.checkinEndTime);
            obj.setHeroTitle(this.heroTitle);
            obj.setHeroDescription(this.heroDescription);
            obj.setButtonText(this.buttonText);
            obj.setCheckedButtonText(this.checkedButtonText);
            obj.setCreatedBy(this.createdBy);
            obj.setUpdatedBy(this.updatedBy);
            return obj;
        }
    }
    
    public static CheckinProgramBuilder builder() { return new CheckinProgramBuilder(); }
    public String getProgramType() { return this.programType; }
    public void setProgramType(String programType) { this.programType = programType; }
    public Boolean getRequireConsecutive() { return this.requireConsecutive; }
    public void setRequireConsecutive(Boolean requireConsecutive) { this.requireConsecutive = requireConsecutive; }
    public Boolean getResetOnMiss() { return this.resetOnMiss; }
    public void setResetOnMiss(Boolean resetOnMiss) { this.resetOnMiss = resetOnMiss; }
    public Boolean getAllowRepeat() { return this.allowRepeat; }
    public void setAllowRepeat(Boolean allowRepeat) { this.allowRepeat = allowRepeat; }
    public String getRepeatType() { return this.repeatType; }
    public void setRepeatType(String repeatType) { this.repeatType = repeatType; }
    public String getTimezone() { return this.timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getConfettiEnabled() { return this.confettiEnabled; }
    public void setConfettiEnabled(Boolean confettiEnabled) { this.confettiEnabled = confettiEnabled; }
    public Boolean getAnimationEnabled() { return this.animationEnabled; }
    public void setAnimationEnabled(Boolean animationEnabled) { this.animationEnabled = animationEnabled; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
