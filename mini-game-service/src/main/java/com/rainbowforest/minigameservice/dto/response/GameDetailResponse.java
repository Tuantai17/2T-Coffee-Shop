package com.rainbowforest.minigameservice.dto.response;

import com.rainbowforest.minigameservice.dto.config.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private String type;
    private String thumbnailUrl;
    private String bannerUrl;
    private String shortDescription;
    private String description;
    private String rules;
    private Integer dailyPlayLimit;
    private String status;
    private Boolean visible;
    private String version;
    
    private GameplayConfigDTO gameplayConfig;
    private UiConfigDTO uiConfig;
    private ThemeConfigDTO themeConfig;
    private RewardConfigDTO rewardConfig;
    private AnalyticsConfigDTO analyticsConfig;
    
    private List<RewardResponse> rewards;
    private Integer remainingPlays;
    private String rewardRange;
}
