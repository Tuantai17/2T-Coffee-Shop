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
@Schema(description = "Kết quả sau khi hoàn thành lượt chơi")
public class PlayGameResponse {
    private Long sessionId;
    private Long gameId;
    private String gameName;
    private String result;
    private Integer score;
    private LocalDateTime playedAt;
    private Integer remainingPlays;
    private RewardResponse reward;
    private Long pointEarned;
    private String voucherId;
    private Boolean success;
    private String status; // "COMPLETED" or "FAILED"
    private String reason;
    private Boolean completed;
    private Integer matchedPairs;
    private Integer attempts;
    private Integer duration;
    private String message;
}
