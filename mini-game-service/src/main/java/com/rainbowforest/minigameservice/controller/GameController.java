package com.rainbowforest.minigameservice.controller;

import com.rainbowforest.minigameservice.service.MemoryMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private MemoryMatchService memoryMatchService;

    @GetMapping("/memory-match/status")
    public ResponseEntity<?> getStatus(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        return ResponseEntity.ok(memoryMatchService.getGameStatus(userId));
    }

    @GetMapping("/memory-match/levels")
    public ResponseEntity<?> getLevels() {
        return ResponseEntity.ok(memoryMatchService.getLevels());
    }

    @PostMapping("/memory-match/sessions")
    public ResponseEntity<?> createSession(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                           @RequestBody Map<String, Object> payload) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        String levelCode = (String) payload.get("levelCode");
        
        try {
            return ResponseEntity.ok(memoryMatchService.createSession(userId, levelCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/memory-match/sessions/{sessionId}")
    public ResponseEntity<?> getSession(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                        @PathVariable String sessionId) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        
        try {
            return ResponseEntity.ok(memoryMatchService.getSession(userId, sessionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/memory-match/sessions/{sessionId}/complete")
    public ResponseEntity<?> completeSession(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                             @PathVariable String sessionId,
                                             @RequestBody Map<String, Object> payload) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        
        int moves = (int) payload.getOrDefault("moves", 0);
        int timeTaken = (int) payload.getOrDefault("timeTakenSeconds", 0);
        
        try {
            return ResponseEntity.ok(memoryMatchService.completeSession(userId, sessionId, moves, timeTaken));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/memory-match/sessions/{sessionId}/abandon")
    public ResponseEntity<?> abandonSession(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                            @PathVariable String sessionId) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        
        try {
            memoryMatchService.abandonSession(userId, sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Autowired
    private com.rainbowforest.minigameservice.repository.GameSessionRepository sessionRepository;

    @GetMapping("/me/history")
    public ResponseEntity<?> getHistory(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(userIdHeader);
        return ResponseEntity.ok(sessionRepository.findByUserIdOrderByStartedAtDesc(userId));
    }
}
