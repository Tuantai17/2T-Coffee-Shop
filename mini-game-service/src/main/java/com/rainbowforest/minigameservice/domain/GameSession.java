package com.rainbowforest.minigameservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSession {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "level_id", nullable = false)
    private GameLevel level;

    @Column(name = "deck_layout", nullable = false, columnDefinition = "TEXT")
    private String deckLayout;

    @Column(nullable = false, length = 30)
    private String status; // PLAYING, WON, LOST, ABANDONED

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "reward_type", length = 30)
    private String rewardType;

    @Column(name = "reward_value", length = 50)
    private String rewardValue;

    @Column
    private Integer moves;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) status = "PLAYING";
        if (moves == null) moves = 0;
    }
}
