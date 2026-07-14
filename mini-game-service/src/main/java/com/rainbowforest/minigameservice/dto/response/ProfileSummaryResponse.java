package com.rainbowforest.minigameservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Tổng quan cá nhân của người chơi")
public class ProfileSummaryResponse {
    private Long totalPlays;
    private Long totalPoints;
    private Long totalVouchers;
    private LocalDateTime lastPlayedAt;
    private List<HistoryResponse> recentHistory;
    private List<GameSummaryResponse> games;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameSummaryResponse {
        private Long gameId;
        private String gameName;
        private String slug;
        private Long plays;
        private Long points;
        private Long vouchers;
        private Integer remainingPlays;
        private LocalDateTime lastPlayedAt;
    }
}
