package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "checkin_reward_cycle_items", uniqueConstraints = {@UniqueConstraint(columnNames = {"cycle_id", "day_number"})})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinRewardCycleItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "cycle_id")
    private Long cycleId;
    private Integer dayNumber;
    private String rewardType;
    private String rewardValue;
    private String icon;
    private String description;
}
