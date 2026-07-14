package com.rainbowforest.minigameservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_play_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MiniGamePlaySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private MiniGame game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_id")
    private GameReward reward;

    private Integer score;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Column(name = "point_earned")
    private Long pointEarned;

    @Column(name = "voucher_id", length = 100)
    private String voucherId;

    @Column(nullable = false, length = 30)
    private String result;

    @Column(name = "play_data_json", columnDefinition = "TEXT")
    private String playDataJson;

    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "played_at", nullable = false, updatable = false)
    private LocalDateTime playedAt;

    @PrePersist
    protected void onCreate() {
        playedAt = LocalDateTime.now();
        if (status == null) {
            status = "COMPLETED";
        }
    }
}
