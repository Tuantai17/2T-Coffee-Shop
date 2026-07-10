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
}
