package com.rainbowforest.paymentservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderPaymentSyncRequest {
    private String paymentStatus;
    private String orderStatus;
    private String paymentMethod;
    private String txnRef;
    private String transactionId;
    private String providerTransactionNo;
    private String bankCode;
    private String responseCode;
    private String transactionStatus;
    private String failureReason;
    private LocalDateTime paidAt;
}
