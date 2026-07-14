package com.rainbowforest.minigameservice.controller;

import com.rainbowforest.minigameservice.dto.GamePlayRequest;
import com.rainbowforest.minigameservice.dto.config.*;
import com.rainbowforest.minigameservice.dto.response.*;
import com.rainbowforest.minigameservice.service.UserMiniGameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class UserMiniGameController {

    @Autowired
    private UserMiniGameService userMiniGameService;

    @GetMapping
    public ResponseEntity<List<GameResponse>> getAvailableGames(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(userMiniGameService.getAvailableGames(parseRequiredOrNullUserId(userIdHeader)));
    }

    @GetMapping("/me/summary")
    public ResponseEntity<ProfileSummaryResponse> getMySummary(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        Long userId = parseRequiredUserId(userIdHeader);
        return ResponseEntity.ok(userMiniGameService.getMySummary(userId));
    }

    @GetMapping("/me/history")
    public ResponseEntity<List<HistoryResponse>> getMyHistory(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        Long userId = parseRequiredUserId(userIdHeader);
        return ResponseEntity.ok(userMiniGameService.getMyHistory(userId));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<GameDetailResponse> getGameDetail(
            @PathVariable String slug,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(userMiniGameService.getGameDetail(slug, parseRequiredOrNullUserId(userIdHeader)));
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<PlayGameResponse> playGame(
            @PathVariable Long id,
            @RequestBody(required = false) GamePlayRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp
    ) {
        Long userId = parseRequiredUserId(userIdHeader);
        String ipAddress = realIp != null && !realIp.isBlank() ? realIp : forwardedFor;
        return ResponseEntity.ok(userMiniGameService.playGame(id, userId, request, userAgent, ipAddress));
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard(
            @PathVariable Long id,
            @RequestParam(defaultValue = "all") String period
    ) {
        return ResponseEntity.ok(userMiniGameService.getLeaderboard(id, period));
    }

    @GetMapping("/{id}/recent-winners")
    public ResponseEntity<List<HistoryResponse>> getRecentWinners(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(userMiniGameService.getRecentWinners(id));
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<StatisticResponse> getStatistics(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(userMiniGameService.getGameStatistics(id));
    }

    @GetMapping("/{id}/top-rewards")
    public ResponseEntity<List<RewardResponse>> getTopRewards(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(userMiniGameService.getTopRewards(id));
    }

    @GetMapping("/me/missions")
    public ResponseEntity<List<Object>> getMyMissions(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        Long userId = parseRequiredUserId(userIdHeader);
        return ResponseEntity.ok(userMiniGameService.getMyMissions(userId));
    }

    private Long parseRequiredUserId(String userIdHeader) {
        Long userId = parseRequiredOrNullUserId(userIdHeader);
        if (userId == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userId;
    }

    private Long parseRequiredOrNullUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
