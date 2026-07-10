package com.rainbowforest.paymentservice.controller;

import com.rainbowforest.paymentservice.dto.PaymentRequest;
import com.rainbowforest.paymentservice.dto.PaymentResponse;
import com.rainbowforest.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/payments/create")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @GetMapping("/api/payments/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(paymentId));
    }

    @GetMapping("/api/payments/vnpay/return")
    public ResponseEntity<String> vnpayReturn(@RequestParam Map<String, String> params) {
        // Here we could also verify checksum to show success/fail UI.
        // For API, we'll just return text or a simple HTML.
        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            return ResponseEntity.ok("Thanh toán thành công!");
        } else {
            return ResponseEntity.ok("Thanh toán thất bại hoặc đã bị huỷ.");
        }
    }

    @GetMapping("/api/payments/vnpay/ipn") // VNPay usually sends GET for IPN but sometimes POST.
    public ResponseEntity<String> vnpayIpnGet(@RequestParam Map<String, String> params) {
        paymentService.handleVNPayIPN(params);
        return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
    }

    @PostMapping("/internal/payments/refund")
    public ResponseEntity<Void> refundPayment(@RequestParam Long paymentId) {
        paymentService.refundPayment(paymentId);
        return ResponseEntity.ok().build();
    }
}
