package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.dto.support.AdminStatisticsResponse;
import com.rainbowforest.userservice.dto.support.SupportConversationResponse;
import com.rainbowforest.userservice.dto.support.SupportMessageRequest;
import com.rainbowforest.userservice.dto.support.SupportMessageResponse;
import com.rainbowforest.userservice.entity.SupportConversation;
import com.rainbowforest.userservice.entity.SupportMessage;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.repository.SupportConversationRepository;
import com.rainbowforest.userservice.repository.SupportMessageRepository;
import com.rainbowforest.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class SupportService {

    @Autowired
    private SupportConversationRepository conversationRepo;

    @Autowired
    private SupportMessageRepository messageRepo;

    @Autowired
    private UserRepository userRepo;

    @Transactional
    public SupportMessageResponse saveUserMessage(Long userId, String content) {
        SupportConversation conversation = conversationRepo.findByCustomerIdAndStatus(userId, "OPEN")
                .orElseGet(() -> {
                    SupportConversation newConv = new SupportConversation();
                    newConv.setCustomerId(userId);
                    newConv.setStatus("OPEN");
                    return conversationRepo.save(newConv);
                });

        SupportMessage message = new SupportMessage();
        message.setConversation(conversation);
        message.setSenderId(userId);
        message.setSenderRole("USER");
        message.setContent(content);
        message = messageRepo.save(message);

        conversation.setLastMessage(content);
        conversation.setLastMessageAt(message.getCreatedAt());
        conversation.setAdminUnreadCount(conversation.getAdminUnreadCount() + 1);
        conversationRepo.save(conversation);

        return mapToMessageResponse(message);
    }

    @Transactional
    public SupportMessageResponse saveAdminMessage(Long adminId, SupportMessageRequest request) {
        SupportConversation conversation = conversationRepo.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        SupportMessage message = new SupportMessage();
        message.setConversation(conversation);
        message.setSenderId(adminId);
        message.setSenderRole("ADMIN");
        message.setContent(request.getContent());
        message = messageRepo.save(message);

        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(message.getCreatedAt());
        conversation.setCustomerUnreadCount(conversation.getCustomerUnreadCount() + 1);
        conversationRepo.save(conversation);

        return mapToMessageResponse(message);
    }

    public SupportConversationResponse getUserConversation(Long userId) {
        Optional<SupportConversation> opt = conversationRepo.findByCustomerIdAndStatus(userId, "OPEN");
        if (opt.isEmpty()) return null;
        
        SupportConversation c = opt.get();
        SupportConversationResponse res = new SupportConversationResponse();
        res.setId(c.getId());
        res.setCustomerId(c.getCustomerId());
        res.setStatus(c.getStatus());
        res.setLastMessage(c.getLastMessage());
        res.setLastMessageAt(c.getLastMessageAt());
        res.setAdminUnreadCount(c.getAdminUnreadCount());
        res.setCustomerUnreadCount(c.getCustomerUnreadCount());
        res.setUnreadCount(c.getCustomerUnreadCount());
        return res;
    }

    public Page<SupportMessageResponse> getConversationMessages(Long conversationId, Pageable pageable) {
        return messageRepo.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
                .map(this::mapToMessageResponse);
    }

    public Page<SupportConversationResponse> getAdminConversations(String keyword, Pageable pageable) {
        return conversationRepo.findAllWithFilters(keyword, pageable).map(c -> {
            SupportConversationResponse res = new SupportConversationResponse();
            res.setId(c.getId());
            res.setCustomerId(c.getCustomerId());
            res.setStatus(c.getStatus());
            res.setLastMessage(c.getLastMessage());
            res.setLastMessageAt(c.getLastMessageAt());
            res.setAdminUnreadCount(c.getAdminUnreadCount());
            res.setCustomerUnreadCount(c.getCustomerUnreadCount());
            res.setUnreadCount(c.getAdminUnreadCount());

            userRepo.findById(c.getCustomerId()).ifPresent(u -> {
                if (u.getUserDetails() != null) {
                    String fn = u.getUserDetails().getFirstName() != null ? u.getUserDetails().getFirstName() : "";
                    String ln = u.getUserDetails().getLastName() != null ? u.getUserDetails().getLastName() : "";
                    res.setFullName((fn + " " + ln).trim());
                    res.setEmail(u.getUserDetails().getEmail());
                    res.setPhone(u.getUserDetails().getPhoneNumber());
                } else {
                    res.setFullName(u.getUserName());
                }
            });
            return res;
        });
    }

    @Transactional
    public void markUserMessagesAsRead(Long conversationId) {
        messageRepo.markMessagesAsRead(conversationId, "USER");
        conversationRepo.findById(conversationId).ifPresent(c -> {
            c.setAdminUnreadCount(0);
            conversationRepo.save(c);
        });
    }

    @Transactional
    public void markAdminMessagesAsRead(Long userId) {
        conversationRepo.findByCustomerIdAndStatus(userId, "OPEN").ifPresent(c -> {
            messageRepo.markMessagesAsRead(c.getId(), "ADMIN");
            c.setCustomerUnreadCount(0);
            conversationRepo.save(c);
        });
    }

    public AdminStatisticsResponse getAdminStatistics() {
        long unreadConv = conversationRepo.countUnreadConversations();
        long totalCust = conversationRepo.countTotalConversations();
        
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long todayMsgs = messageRepo.countMessagesInDateRange(startOfDay, endOfDay);
        
        return new AdminStatisticsResponse(unreadConv, totalCust, todayMsgs);
    }

    private SupportMessageResponse mapToMessageResponse(SupportMessage m) {
        SupportMessageResponse res = new SupportMessageResponse();
        res.setId(m.getId());
        res.setConversationId(m.getConversation().getId());
        res.setCustomerId(m.getConversation().getCustomerId());
        res.setSenderId(m.getSenderId());
        res.setSenderRole(m.getSenderRole());
        res.setContent(m.getContent());
        res.setIsRead(m.isRead());
        res.setCreatedAt(m.getCreatedAt());
        return res;
    }
}
