package com.rainbowforest.orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderAdminListDto {
    private Long id;
    private String receiverName;
    private String phone;
    private LocalDateTime orderedDate;
    private BigDecimal total;
    private String paymentMethod;
    private String paymentStatus;
    private String status;
    private List<OrderItemBriefDto> items;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDateTime getOrderedDate() { return orderedDate; }
    public void setOrderedDate(LocalDateTime orderedDate) { this.orderedDate = orderedDate; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<OrderItemBriefDto> getItems() { return items; }
    public void setItems(List<OrderItemBriefDto> items) { this.items = items; }
}
