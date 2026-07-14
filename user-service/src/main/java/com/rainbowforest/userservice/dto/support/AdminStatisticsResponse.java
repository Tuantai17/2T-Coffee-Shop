package com.rainbowforest.userservice.dto.support;

public class AdminStatisticsResponse {
    private long unreadConversations;
    private long totalCustomers;
    private long todayMessages;

    public AdminStatisticsResponse() {}

    public AdminStatisticsResponse(long unreadConversations, long totalCustomers, long todayMessages) {
        this.unreadConversations = unreadConversations;
        this.totalCustomers = totalCustomers;
        this.todayMessages = todayMessages;
    }

    public long getUnreadConversations() { return unreadConversations; }
    public void setUnreadConversations(long unreadConversations) { this.unreadConversations = unreadConversations; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTodayMessages() { return todayMessages; }
    public void setTodayMessages(long todayMessages) { this.todayMessages = todayMessages; }
}
