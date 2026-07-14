package com.rainbowforest.minigameservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "mini_games")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MiniGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Column(name = "daily_play_limit", nullable = false)
    private Integer dailyPlayLimit;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "is_visible", nullable = false)
    private Boolean visible;

    @Column(name = "is_featured", nullable = false)
    private Boolean featured;

    @Column(name = "version", nullable = false, length = 30)
    private String version;

    @Column(name = "gameplay_config", columnDefinition = "TEXT")
    private String gameplayConfig;

    @Column(name = "ui_config", columnDefinition = "TEXT")
    private String uiConfig;

    @Column(name = "theme_config", columnDefinition = "TEXT")
    private String themeConfig;

    @Column(name = "reward_config", columnDefinition = "TEXT")
    private String rewardConfig;

    @Column(name = "analytics_config", columnDefinition = "TEXT")
    private String analyticsConfig;

    @Column(name = "publish_state", length = 20)
    private String publishState;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "is_deleted", nullable = false)
    private Boolean deleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = "ACTIVE";
        }
        if (visible == null) {
            visible = Boolean.TRUE;
        }
        if (featured == null) {
            featured = Boolean.FALSE;
        }
        if (dailyPlayLimit == null) {
            dailyPlayLimit = 0;
        }
        if (version == null || version.isBlank()) {
            version = "v1.0.0";
        }
        if (publishState == null || publishState.isBlank()) {
            publishState = "PUBLISHED";
        }
        if (deleted == null) {
            deleted = Boolean.FALSE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (deleted == null) {
            deleted = Boolean.FALSE;
        }
    }
}
