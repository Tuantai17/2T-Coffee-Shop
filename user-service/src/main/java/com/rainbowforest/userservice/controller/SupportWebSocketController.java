package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.support.SupportMessageRequest;
import com.rainbowforest.userservice.dto.support.SupportMessageResponse;
import com.rainbowforest.userservice.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;

@Controller
public class SupportWebSocketController {

    @Autowired
    private SupportService supportService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/support/user-send")
    public void handleUserMessage(@Payload SupportMessageRequest request, Authentication authentication) {
        if (authentication == null) return;
        
        Long userId = (Long) authentication.getPrincipal();
        
        SupportMessageResponse savedMessage = supportService.saveUserMessage(userId, request.getContent());
        
        // Notify admins about the new message
        messagingTemplate.convertAndSend("/topic/admin/support", savedMessage);
        
        // Echo back to user to confirm sent (optional, but good for realtime sync across devices)
        messagingTemplate.convertAndSend(
                "/topic/support/user/" + userId,
                savedMessage
        );
    }

    @MessageMapping("/support/admin-send")
    public void handleAdminMessage(@Payload SupportMessageRequest request, Authentication authentication) {
        if (authentication == null) return;
        if (!authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return; // Unauthorized
        }

        Long adminId = (Long) authentication.getPrincipal();
        
        SupportMessageResponse savedMessage = supportService.saveAdminMessage(adminId, request);
        
        // Notify the specific customer using customerId
        messagingTemplate.convertAndSend(
                "/topic/support/user/" + savedMessage.getCustomerId(),
                savedMessage
        );
    }
}
