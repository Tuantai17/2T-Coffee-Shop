package com.rainbowforest.minigameservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Phần thưởng của Game")
public class RewardResponse {
    private Long id;
    private String rewardName;
    private String rewardType;
    private Long pointValue;
    private String voucherId;
    private BigDecimal probability;
    private Integer remainingQuantity;
}
