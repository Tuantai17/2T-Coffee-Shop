package com.rainbowforest.minigameservice.dto.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameplayConfigDTO {
    private String gridSize;
    private Integer timer;
    private Integer attempts;
    private String difficulty;
    private List<String> cardImages;
    private Boolean enableCombo;
    private Boolean enableSound;
    private Integer maxPoint;
}
