package com.rainbowforest.userservice.controller;

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
@RequestMapping("/api/support")
public class SupportController {

    @Autowired
    private SupportService supportService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Claims claims = jwtTokenProvider.getClaimsFromJWT(token);
                return claims.get("userId", Long.class);
            }
        }
        throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/conversation/me")
    public ResponseEntity<SupportConversationResponse> getMyConversation(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        SupportConversationResponse res = supportService.getUserConversation(userId);
        if (res == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/messages/me")
    public ResponseEntity<Page<SupportMessageResponse>> getMyMessages(
            @RequestHeader("Authorization") String authHeader,
            Pageable pageable) {
        Long userId = getUserIdFromHeader(authHeader);
        SupportConversationResponse conv = supportService.getUserConversation(userId);
        if (conv == null) {
            return ResponseEntity.ok(Page.empty(pageable));
        }
        return ResponseEntity.ok(supportService.getConversationMessages(conv.getId(), pageable));
    }

    @PatchMapping("/conversation/me/read")
    public ResponseEntity<Void> markAsRead(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        SupportConversationResponse conv = supportService.getUserConversation(userId);
        if (conv != null) {
            supportService.markAdminMessagesAsRead(userId);
        }
        return ResponseEntity.ok().build();
    }
}
