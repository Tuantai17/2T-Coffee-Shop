package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.notificationservice.domain.Notification;
import com.rainbowforest.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    private String extractUserId(HttpServletRequest request) {
        return request.getHeader("X-User-Id");
    }

    private String extractUserRole(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role != null) {
            // Normalize role
            if (role.startsWith("ROLE_")) {
                return role.substring(5);
            }
            return role;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean unreadOnly,
            HttpServletRequest request) {
        
        String userId = extractUserId(request);
        String role = extractUserRole(request);
        
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            userId = "ADMIN";
        }

        if (userId == null || role == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Page<Notification> notifications = notificationService.getNotifications(
                userId, role, category, unreadOnly, PageRequest.of(page, size));
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Notification>> getLatestNotifications(HttpServletRequest request) {
        String userId = extractUserId(request);
        String role = extractUserRole(request);
        
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            userId = "ADMIN";
        }
        
        if (userId == null || role == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<Notification> notifications = notificationService.getLatestNotifications(userId, role);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") String id, HttpServletRequest request) {
        String userId = extractUserId(request);
        String role = extractUserRole(request);
        
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            userId = "ADMIN";
        }
        
        if (userId == null || role == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        notificationService.markAsRead(id, userId, role);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        String userId = extractUserId(request);
        String role = extractUserRole(request);
        
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            userId = "ADMIN";
        }
        
        if (userId == null || role == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        notificationService.markAllAsRead(userId, role);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(HttpServletRequest request) {
        String userId = extractUserId(request);
        String role = extractUserRole(request);
        
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            userId = "ADMIN";
        }
        
        if (userId == null || role == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        return ResponseEntity.ok(notificationService.getUnreadCount(userId, role));
    }
}
