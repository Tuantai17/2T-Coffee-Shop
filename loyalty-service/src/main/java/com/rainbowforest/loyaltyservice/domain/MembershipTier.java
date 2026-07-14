package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "membership_tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipTier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "minimum_completed_orders", nullable = false)
    private Integer minimumCompletedOrders;

    @Column(name = "minimum_eligible_spending", nullable = false)
    private Long minimumEligibleSpending;

    @Column(name = "evaluation_months", nullable = false)
    private Integer evaluationMonths;

    @Column(name = "daily_checkin_points", nullable = false)
    private Long dailyCheckinPoints;

    @Column(name = "daily_spin_count", nullable = false)
    private Integer dailySpinCount;

    @Column(name = "upgrade_voucher_value", nullable = false)
    private Long upgradeVoucherValue;

    @Column(name = "birthday_voucher_value", nullable = false)
    private Long birthdayVoucherValue;

    @Column(name = "monthly_freeship_count", nullable = false)
    private Integer monthlyFreeshipCount;

    @Column(name = "priority_support", nullable = false)
    private Boolean prioritySupport;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean active;

    @Column(length = 20)
    private String color;

    @Column(length = 50)
    private String icon;
    public void setIcon(String icon) { this.icon = icon; }
    public String getIcon() { return icon; }
    public void setColor(String color) { this.color = color; }
    public String getColor() { return color; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getActive() { return active; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setPrioritySupport(Boolean prioritySupport) { this.prioritySupport = prioritySupport; }
    public Boolean getPrioritySupport() { return prioritySupport; }
    public void setMonthlyFreeshipCount(Integer monthlyFreeshipCount) { this.monthlyFreeshipCount = monthlyFreeshipCount; }
    public Integer getMonthlyFreeshipCount() { return monthlyFreeshipCount; }
    public void setBirthdayVoucherValue(Long birthdayVoucherValue) { this.birthdayVoucherValue = birthdayVoucherValue; }
    public Long getBirthdayVoucherValue() { return birthdayVoucherValue; }
    public void setUpgradeVoucherValue(Long upgradeVoucherValue) { this.upgradeVoucherValue = upgradeVoucherValue; }
    public Long getUpgradeVoucherValue() { return upgradeVoucherValue; }
    public void setDailySpinCount(Integer dailySpinCount) { this.dailySpinCount = dailySpinCount; }
    public Integer getDailySpinCount() { return dailySpinCount; }
    public void setDailyCheckinPoints(Long dailyCheckinPoints) { this.dailyCheckinPoints = dailyCheckinPoints; }
    public Long getDailyCheckinPoints() { return dailyCheckinPoints; }
    public void setEvaluationMonths(Integer evaluationMonths) { this.evaluationMonths = evaluationMonths; }
    public Integer getEvaluationMonths() { return evaluationMonths; }
    public void setMinimumEligibleSpending(Long minimumEligibleSpending) { this.minimumEligibleSpending = minimumEligibleSpending; }
    public Long getMinimumEligibleSpending() { return minimumEligibleSpending; }
    public void setMinimumCompletedOrders(Integer minimumCompletedOrders) { this.minimumCompletedOrders = minimumCompletedOrders; }
    public Integer getMinimumCompletedOrders() { return minimumCompletedOrders; }
    public void setName(String name) { this.name = name; }
    public String getName() { return name; }
    public void setCode(String code) { this.code = code; }
    public String getCode() { return code; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class MembershipTierBuilder {
        private Long id;
        private String code;
        private String name;
        private Integer minimumCompletedOrders;
        private Long minimumEligibleSpending;
        private Integer evaluationMonths;
        private Long dailyCheckinPoints;
        private Integer dailySpinCount;
        private Long upgradeVoucherValue;
        private Long birthdayVoucherValue;
        private Integer monthlyFreeshipCount;
        private Boolean prioritySupport;
        private Integer displayOrder;
        private Boolean active;
        private String color;
        private String icon;

        public MembershipTierBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MembershipTierBuilder code(String code) {
            this.code = code;
            return this;
        }

        public MembershipTierBuilder name(String name) {
            this.name = name;
            return this;
        }

        public MembershipTierBuilder minimumCompletedOrders(Integer minimumCompletedOrders) {
            this.minimumCompletedOrders = minimumCompletedOrders;
            return this;
        }

        public MembershipTierBuilder minimumEligibleSpending(Long minimumEligibleSpending) {
            this.minimumEligibleSpending = minimumEligibleSpending;
            return this;
        }

        public MembershipTierBuilder evaluationMonths(Integer evaluationMonths) {
            this.evaluationMonths = evaluationMonths;
            return this;
        }

        public MembershipTierBuilder dailyCheckinPoints(Long dailyCheckinPoints) {
            this.dailyCheckinPoints = dailyCheckinPoints;
            return this;
        }

        public MembershipTierBuilder dailySpinCount(Integer dailySpinCount) {
            this.dailySpinCount = dailySpinCount;
            return this;
        }

        public MembershipTierBuilder upgradeVoucherValue(Long upgradeVoucherValue) {
            this.upgradeVoucherValue = upgradeVoucherValue;
            return this;
        }

        public MembershipTierBuilder birthdayVoucherValue(Long birthdayVoucherValue) {
            this.birthdayVoucherValue = birthdayVoucherValue;
            return this;
        }

        public MembershipTierBuilder monthlyFreeshipCount(Integer monthlyFreeshipCount) {
            this.monthlyFreeshipCount = monthlyFreeshipCount;
            return this;
        }

        public MembershipTierBuilder prioritySupport(Boolean prioritySupport) {
            this.prioritySupport = prioritySupport;
            return this;
        }

        public MembershipTierBuilder displayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
            return this;
        }

        public MembershipTierBuilder active(Boolean active) {
            this.active = active;
            return this;
        }

        public MembershipTierBuilder color(String color) {
            this.color = color;
            return this;
        }

        public MembershipTierBuilder icon(String icon) {
            this.icon = icon;
            return this;
        }

        public MembershipTier build() {
            MembershipTier obj = new MembershipTier();
            obj.setId(this.id);
            obj.setCode(this.code);
            obj.setName(this.name);
            obj.setMinimumCompletedOrders(this.minimumCompletedOrders);
            obj.setMinimumEligibleSpending(this.minimumEligibleSpending);
            obj.setEvaluationMonths(this.evaluationMonths);
            obj.setDailyCheckinPoints(this.dailyCheckinPoints);
            obj.setDailySpinCount(this.dailySpinCount);
            obj.setUpgradeVoucherValue(this.upgradeVoucherValue);
            obj.setBirthdayVoucherValue(this.birthdayVoucherValue);
            obj.setMonthlyFreeshipCount(this.monthlyFreeshipCount);
            obj.setPrioritySupport(this.prioritySupport);
            obj.setDisplayOrder(this.displayOrder);
            obj.setActive(this.active);
            obj.setColor(this.color);
            obj.setIcon(this.icon);
            return obj;
        }
    }
    
    public static MembershipTierBuilder builder() { return new MembershipTierBuilder(); }
}
