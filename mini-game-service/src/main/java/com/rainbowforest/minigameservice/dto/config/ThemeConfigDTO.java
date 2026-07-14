package com.rainbowforest.minigameservice.dto.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeConfigDTO {
    private String primaryColor;
    private String secondaryColor;
    private String backgroundColor;
    private String cardStyle;
    private String animationType;
}
