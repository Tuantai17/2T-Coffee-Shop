package com.rainbowforest.minigameservice.dto.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsConfigDTO {
    private Boolean trackPlays;
    private Boolean trackWins;
    private Boolean trackDropoffs;
    private String googleAnalyticsId;
}
