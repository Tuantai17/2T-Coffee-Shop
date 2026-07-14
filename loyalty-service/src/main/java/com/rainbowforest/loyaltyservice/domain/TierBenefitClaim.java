package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tier_benefit_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierBenefitClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tier_code", nullable = false)
    private String tierCode;

    @Column(name = "claim_year", nullable = false)
    private Integer claimYear;

    @Column(name = "claim_month", nullable = false)
    private Integer claimMonth;

    @Column(name = "claimed_at", nullable = false)
    private LocalDateTime claimedAt;
}
