package com.rainbowforest.userservice.dto.support;

import java.time.LocalDateTime;

public class SupportConversationResponse {
    private Long id; // Same as conversationId for backward compatibility in naming
    private Long conversationId;
    private Long customerId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    
    private String status;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int adminUnreadCount;
    private int customerUnreadCount;
    private int unreadCount; // Alias for adminUnreadCount or customerUnreadCount depending on context

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; this.conversationId = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; this.id = conversationId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public int getAdminUnreadCount() { return adminUnreadCount; }
    public void setAdminUnreadCount(int adminUnreadCount) { this.adminUnreadCount = adminUnreadCount; }

    public int getCustomerUnreadCount() { return customerUnreadCount; }
    public void setCustomerUnreadCount(int customerUnreadCount) { this.customerUnreadCount = customerUnreadCount; }

    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
}
