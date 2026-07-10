package com.rainbowforest.orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OrderAdminDetailDto {
    private Long id;
    private LocalDateTime orderedDate;
    private String status;
    private String receiverName;
    private String phone;
    private String address;
    private String province;
    private String district;
    private String ward;
    private String note;
    private String paymentMethod;
    private String paymentStatus;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal total;
    
    // User info
    private Long userId;
    private String userName;
    private String userEmail;
    
    private LocalDate expectedRestockDate;
    private String restockNote;
    private String cancelReason;
    private java.time.LocalDateTime cancelledAt;
    private String cancelledBy;
    private List<OrderItemDetailDto> items;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getOrderedDate() { return orderedDate; }
    public void setOrderedDate(LocalDateTime orderedDate) { this.orderedDate = orderedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public LocalDate getExpectedRestockDate() { return expectedRestockDate; }
    public void setExpectedRestockDate(LocalDate expectedRestockDate) { this.expectedRestockDate = expectedRestockDate; }

    public String getRestockNote() { return restockNote; }
    public void setRestockNote(String restockNote) { this.restockNote = restockNote; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public java.time.LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(java.time.LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public List<OrderItemDetailDto> getItems() { return items; }
    public void setItems(List<OrderItemDetailDto> items) { this.items = items; }
}
