package com.rainbowforest.paymentservice.service;

import com.rainbowforest.paymentservice.config.VNPayConfig;
import com.rainbowforest.paymentservice.domain.Payment;
import com.rainbowforest.paymentservice.domain.PaymentLog;
import com.rainbowforest.paymentservice.dto.PaymentRequest;
import com.rainbowforest.paymentservice.dto.PaymentResponse;
import com.rainbowforest.paymentservice.repository.PaymentLogRepository;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final VNPayConfig vnPayConfig;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Optional<Payment> existingOpt = paymentRepository.findByOrderId(request.getOrderId());
        if (existingOpt.isPresent() && !existingOpt.get().getStatus().equals("FAILED")) {
            throw new RuntimeException("Payment already exists and not failed for order: " + request.getOrderId());
        }

        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("PENDING");
        
        String txnRef = "TXN" + request.getOrderId() + "_" + System.currentTimeMillis();
        payment.setTransactionId(txnRef);
        payment = paymentRepository.save(payment);

        paymentLogRepository.save(new PaymentLog(payment, "CREATE", "Payment initialized"));

        String paymentUrl = null;
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            paymentUrl = generateVNPayUrl(payment, request.getIpAddress());
        } else if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            // COD auto success on create (or could stay pending until delivered)
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);
            paymentLogRepository.save(new PaymentLog(payment, "STATUS_UPDATE", "COD auto marked success"));
            sendPaymentEvent(payment);
        }

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paymentUrl(paymentUrl)
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private String generateVNPayUrl(Payment payment, String ipAddress) {
        String vnp_Version = vnPayConfig.getVersion();
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan don hang " + payment.getOrderId();
        String orderType = "other";
        String vnp_TxnRef = payment.getTransactionId();
        String vnp_IpAddr = ipAddress != null ? ipAddress : "127.0.0.1";
        String vnp_TmnCode = vnPayConfig.getTmnCode();

        long amount = payment.getAmount().multiply(new BigDecimal(100)).longValue();
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

    @Override
    public PaymentResponse getPaymentStatus(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void handleVNPayIPN(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (params.containsKey("vnp_SecureHashType")) {
            params.remove("vnp_SecureHashType");
        }
        params.remove("vnp_SecureHash");

        String signValue = vnPayConfig.hashAllFields(params);
        if (!signValue.equals(vnp_SecureHash)) {
            log.error("VNPay Invalid Checksum");
            return;
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(txnRef);
        if (paymentOpt.isEmpty()) {
            log.error("Payment not found for TxnRef: {}", txnRef);
            return;
        }

        Payment payment = paymentOpt.get();
        
        // Idempotency check
        if (!"PENDING".equals(payment.getStatus())) {
            log.info("Payment {} already processed. Current status: {}", payment.getId(), payment.getStatus());
            return;
        }

        if ("00".equals(responseCode)) {
            payment.setStatus("SUCCESS");
        } else {
            payment.setStatus("FAILED");
        }
        
        paymentRepository.save(payment);
        paymentLogRepository.save(new PaymentLog(payment, "IPN_RECEIVE", "ResponseCode: " + responseCode));

        // Notify OrderService via Kafka
        sendPaymentEvent(payment);
    }

    @Override
    @Transactional
    public void refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new RuntimeException("Can only refund SUCCESS payment");
        }
        
        payment.setStatus("REFUNDED");
        paymentRepository.save(payment);
        paymentLogRepository.save(new PaymentLog(payment, "REFUND", "Refund processed"));
        
        // Notify OrderService via Kafka if needed, or OrderService initiates this.
        sendPaymentEvent(payment);
    }

    @Override
    @Transactional
    public void refundPaymentByOrderId(Long orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            if ("SUCCESS".equals(payment.getStatus())) {
                payment.setStatus("REFUNDED");
                paymentRepository.save(payment);
                paymentLogRepository.save(new PaymentLog(payment, "REFUND", "Auto-refund processed due to order cancellation"));
                sendPaymentEvent(payment);
                log.info("Auto-refunded payment {} for order {}", payment.getId(), orderId);
            } else {
                log.info("Payment for order {} is in status {}, no refund processed.", orderId, payment.getStatus());
            }
        } else {
            log.warn("No payment found for order {} to refund", orderId);
        }
    }

    private void sendPaymentEvent(Payment payment) {
        Map<String, Object> event = new HashMap<>();
        event.put("orderId", payment.getOrderId());
        event.put("status", payment.getStatus());
        event.put("paymentMethod", payment.getPaymentMethod());
        kafkaTemplate.send("payment-events", String.valueOf(payment.getOrderId()), event);
    }
}
