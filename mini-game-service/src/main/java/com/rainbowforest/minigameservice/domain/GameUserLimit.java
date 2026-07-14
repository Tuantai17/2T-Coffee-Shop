package com.rainbowforest.minigameservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "game_user_limits",
        uniqueConstraints = @UniqueConstraint(name = "uk_game_user_limit", columnNames = {"user_id", "game_id", "play_date"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameUserLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private MiniGame game;

    @Column(name = "play_date", nullable = false)
    private LocalDate playDate;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    @Column(name = "max_count", nullable = false)
    private Integer maxCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (usedCount == null) {
            usedCount = 0;
        }
        if (maxCount == null) {
            maxCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
