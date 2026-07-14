package com.rainbowforest.minigameservice.dto;

import java.util.Map;

public record GamePlayRequest(
        Integer score,
        Map<String, Object> playData
) {
}
