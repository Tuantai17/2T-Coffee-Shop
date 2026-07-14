package com.rainbowforest.minigameservice.dto.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UiConfigDTO {
    private String bannerUrl;
    private String titleText;
    private String buttonText;
    private Boolean showLeaderboard;
    private Boolean showHistory;
    private Boolean showTutorial;
}
