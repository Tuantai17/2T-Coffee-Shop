package com.rainbowforest.minigameservice.controller;

import com.rainbowforest.minigameservice.dto.GameRewardUpsertRequest;
import com.rainbowforest.minigameservice.dto.MiniGameUpsertRequest;
import com.rainbowforest.minigameservice.service.AdminMiniGameService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/mini-games")
public class AdminMiniGameController {

    @Autowired
    private AdminMiniGameService adminMiniGameService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminMiniGameService.getDashboard());
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGames(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean visible,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminMiniGameService.getGames(search, type, status, visible, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getGame(@PathVariable Long id) {
        return ResponseEntity.ok(adminMiniGameService.getGame(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createGame(
            @Valid @RequestBody MiniGameUpsertRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(adminMiniGameService.createGame(request, parseUserId(userIdHeader)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateGame(
            @PathVariable Long id,
            @Valid @RequestBody MiniGameUpsertRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(adminMiniGameService.updateGame(id, request, parseUserId(userIdHeader)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(adminMiniGameService.updateStatus(id, payload.get("status"), parseUserId(userIdHeader)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        adminMiniGameService.softDelete(id, parseUserId(userIdHeader));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(adminMiniGameService.getAnalytics(id));
    }

    @GetMapping("/rewards")
    public ResponseEntity<List<Map<String, Object>>> getRewards(
            @RequestParam(required = false) Long gameId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String rewardType,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminMiniGameService.getRewards(gameId, search, rewardType, status));
    }

    @GetMapping("/rewards/export")
    public ResponseEntity<String> exportRewards(
            @RequestParam(required = false) Long gameId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String rewardType,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=minigame-rewards-report.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(adminMiniGameService.exportRewards(gameId, search, rewardType, status));
    }

    @PostMapping("/{id}/rewards")
    public ResponseEntity<Map<String, Object>> createReward(
            @PathVariable Long id,
            @Valid @RequestBody GameRewardUpsertRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(adminMiniGameService.createReward(id, request, parseUserId(userIdHeader)));
    }

    @PutMapping("/rewards/{rewardId}")
    public ResponseEntity<Map<String, Object>> updateReward(
            @PathVariable Long rewardId,
            @Valid @RequestBody GameRewardUpsertRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        return ResponseEntity.ok(adminMiniGameService.updateReward(rewardId, request, parseUserId(userIdHeader)));
    }

    @DeleteMapping("/rewards/{rewardId}")
    public ResponseEntity<Void> deleteReward(
            @PathVariable Long rewardId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        adminMiniGameService.deleteReward(rewardId, parseUserId(userIdHeader));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/play-sessions")
    public ResponseEntity<List<Map<String, Object>>> getPlaySessions(
            @RequestParam(required = false) Long gameId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "200") int limit
    ) {
        return ResponseEntity.ok(adminMiniGameService.getPlaySessions(gameId, userId, fromDate, toDate, limit));
    }

    @GetMapping("/play-sessions/export")
    public ResponseEntity<String> exportPlaySessions(
            @RequestParam(required = false) Long gameId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "500") int limit
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=minigame-play-sessions.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(adminMiniGameService.exportPlaySessions(gameId, userId, fromDate, toDate, limit));
    }

    @GetMapping("/{id}/activity-logs/export")
    public ResponseEntity<String> exportActivityLogs(@PathVariable Long id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=minigame-activity-log.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(adminMiniGameService.exportActivityLogs(id));
    }

    private Long parseUserId(String userIdHeader) {
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
