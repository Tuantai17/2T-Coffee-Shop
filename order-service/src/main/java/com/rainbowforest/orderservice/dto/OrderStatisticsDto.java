package com.rainbowforest.orderservice.dto;

import java.math.BigDecimal;

public class OrderStatisticsDto {
    private long totalOrders;
    private long pendingConfirmation;
    private long packing;
    private long awaitingCustomer;
    private long shipping;
    private long completed;
    private long cancelled;
    private BigDecimal totalRevenue;

    // Getters and Setters
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getPendingConfirmation() { return pendingConfirmation; }
    public void setPendingConfirmation(long pendingConfirmation) { this.pendingConfirmation = pendingConfirmation; }

    public long getPacking() { return packing; }
    public void setPacking(long packing) { this.packing = packing; }

    public long getAwaitingCustomer() { return awaitingCustomer; }
    public void setAwaitingCustomer(long awaitingCustomer) { this.awaitingCustomer = awaitingCustomer; }

    public long getShipping() { return shipping; }
    public void setShipping(long shipping) { this.shipping = shipping; }

    public long getCompleted() { return completed; }
    public void setCompleted(long completed) { this.completed = completed; }

    public long getCancelled() { return cancelled; }
    public void setCancelled(long cancelled) { this.cancelled = cancelled; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
