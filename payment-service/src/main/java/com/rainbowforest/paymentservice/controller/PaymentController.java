package com.rainbowforest.paymentservice.controller;

import com.rainbowforest.paymentservice.dto.PaymentRequest;
import com.rainbowforest.paymentservice.dto.PaymentResponse;
import com.rainbowforest.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    
    @Value("${frontend.public.url:http://localhost:5173}")
    private String frontendPublicUrl;

    @PostMapping("/vnpay/create")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId, 
            @RequestBody PaymentRequest request) {
        if (headerUserId != null) {
            request.setUserId(headerUserId);
        }
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @GetMapping("/vnpay/status/{txnRef}")
    public ResponseEntity<PaymentResponse> getPaymentStatusByTxnRef(@PathVariable String txnRef) {
        return ResponseEntity.ok(paymentService.getPaymentStatusByTxnRef(txnRef));
    }

    @PostMapping("/vnpay/verify-return")
    public ResponseEntity<PaymentResponse> verifyVNPayReturn(@RequestBody Map<String, String> params) {
        return ResponseEntity.ok(paymentService.verifyVNPayReturn(params));
    }

    @GetMapping("/vnpay/return")
    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        try {
            paymentService.handleVNPayReturn(params);
        } catch (Exception exception) {
            log.error("VNPay return handling error", exception);
        }

        String queryString = params.entrySet().stream()
                .filter(entry -> entry.getKey() != null && entry.getValue() != null)
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8)
                        + "="
                        + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        String redirectUrl = frontendPublicUrl + "/payment/vnpay/result";
        if (!queryString.isBlank()) {
            redirectUrl += "?" + queryString;
        }
        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpnGet(@RequestParam Map<String, String> params) {
        try {
            paymentService.handleVNPayIPN(params);
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (Exception e) {
            log.error("IPN Error", e);
            String message = e.getMessage();
            if ("Invalid Checksum".equals(message)) {
                return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
            } else if ("Order not found".equals(message)) {
                return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
            } else if ("Invalid Amount".equals(message)) {
                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
            } else if ("Order already confirmed".equals(message)) {
                return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("RspCode", "99", "Message", "Unknown error"));
        }
    }

    @PostMapping("/internal/refund")
    public ResponseEntity<Void> refundPayment(@RequestParam Long paymentId) {
        paymentService.refundPayment(paymentId);
        return ResponseEntity.ok().build();
    }
}
