package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.support.AdminStatisticsResponse;
import com.rainbowforest.userservice.dto.support.SupportConversationResponse;
import com.rainbowforest.userservice.dto.support.SupportMessageResponse;
import com.rainbowforest.userservice.security.JwtTokenProvider;
import com.rainbowforest.userservice.service.SupportService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/support")
public class AdminSupportController {

    @Autowired
    private SupportService supportService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private void verifyAdminRole(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Claims claims = jwtTokenProvider.getClaimsFromJWT(token);
                String role = claims.get("role", String.class);
                if ("ADMIN".equals(role) || "ROLE_ADMIN".equals(role)) {
                    return;
                }
            }
        }
        throw new RuntimeException("Unauthorized: Admin role required");
    }

    @GetMapping("/conversations")
    public ResponseEntity<Page<SupportConversationResponse>> getConversations(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "keyword", required = false) String keyword,
            Pageable pageable) {
        verifyAdminRole(authHeader);
        return ResponseEntity.ok(supportService.getAdminConversations(keyword, pageable));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Page<SupportMessageResponse>> getMessages(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long conversationId,
            Pageable pageable) {
        verifyAdminRole(authHeader);
        return ResponseEntity.ok(supportService.getConversationMessages(conversationId, pageable));
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long conversationId) {
        verifyAdminRole(authHeader);
        supportService.markUserMessagesAsRead(conversationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsResponse> getStatistics(
            @RequestHeader("Authorization") String authHeader) {
        verifyAdminRole(authHeader);
        return ResponseEntity.ok(supportService.getAdminStatistics());
    }
}
