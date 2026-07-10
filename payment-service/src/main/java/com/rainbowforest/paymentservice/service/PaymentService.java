package com.rainbowforest.paymentservice.service;

import com.rainbowforest.paymentservice.dto.PaymentRequest;
import com.rainbowforest.paymentservice.dto.PaymentResponse;

import java.util.Map;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse getPaymentStatus(Long paymentId);
    void handleVNPayIPN(Map<String, String> params);
    void refundPayment(Long paymentId);
    void refundPaymentByOrderId(Long orderId);
}
