package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.notificationservice.domain.Notification;
import com.rainbowforest.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    private Long extractUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        if (userIdStr != null) {
            return Long.parseLong(userIdStr);
        }
        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") String id, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }
}
