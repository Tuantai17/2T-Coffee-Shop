package com.rainbowforest.minigameservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Lịch sử lượt chơi")
public class HistoryResponse {
    private Long id;
    private Long gameId;
    private String gameName;
    private String slug;
    private String result;
    private Integer score;
    private Long pointEarned;
    private String voucherId;
    private LocalDateTime playedAt;
    private String rewardName;
}
