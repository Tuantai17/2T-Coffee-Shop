package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_tier_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberTierHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "old_tier_code", length = 30)
    private String oldTierCode;

    @Column(name = "new_tier_code", nullable = false, length = 30)
    private String newTierCode;

    @Column(name = "completed_orders_6_months", nullable = false)
    private Integer completedOrders6Months;

    @Column(name = "eligible_spending_6_months", nullable = false)
    private Long eligibleSpending6Months;

    @Column(name = "reason", length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;
}
