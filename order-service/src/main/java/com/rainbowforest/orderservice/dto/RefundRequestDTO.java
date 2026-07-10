package com.rainbowforest.orderservice.dto;

import java.util.List;

public class RefundRequestDTO {
    private String idempotencyKey;
    private String refundType; // FULL, PARTIAL
    private String reason;
    private List<RefundItemRequestDTO> items;

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getRefundType() { return refundType; }
    public void setRefundType(String refundType) { this.refundType = refundType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<RefundItemRequestDTO> getItems() { return items; }
    public void setItems(List<RefundItemRequestDTO> items) { this.items = items; }
}
