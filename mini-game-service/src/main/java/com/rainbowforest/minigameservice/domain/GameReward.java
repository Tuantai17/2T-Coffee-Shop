package com.rainbowforest.minigameservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_rewards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private MiniGame game;

    @Column(name = "reward_name", nullable = false, length = 150)
    private String rewardName;

    @Column(name = "reward_type", nullable = false, length = 30)
    private String rewardType;

    @Column(name = "point_value")
    private Long pointValue;

    @Column(name = "voucher_id", length = 100)
    private String voucherId;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal probability;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "remaining_quantity", nullable = false)
    private Integer remainingQuantity;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (probability == null) {
            probability = BigDecimal.ZERO;
        }
        if (totalQuantity == null) {
            totalQuantity = 0;
        }
        if (remainingQuantity == null) {
            remainingQuantity = totalQuantity;
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
