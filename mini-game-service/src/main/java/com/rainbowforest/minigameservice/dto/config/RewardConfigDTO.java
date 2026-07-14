package com.rainbowforest.minigameservice.dto.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardConfigDTO {
    private String rewardStrategy;
    private Boolean allowMultipleWins;
    private Integer maxWinPerDay;
    private Boolean enableConsolationPrize;
}
