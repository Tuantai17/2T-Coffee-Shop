package com.rainbowforest.userservice.dto.support;

public class SupportMessageRequest {
    private Long conversationId; // Optional for USER, required for ADMIN
    private String content;

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
