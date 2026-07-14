package com.rainbowforest.minigameservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thống kê tổng quan Game")
public class StatisticResponse {
    private Long totalPlays;
    private Long totalPlayers;
    private Long totalPointsEarned;
    private Long totalVouchersDistributed;
}
