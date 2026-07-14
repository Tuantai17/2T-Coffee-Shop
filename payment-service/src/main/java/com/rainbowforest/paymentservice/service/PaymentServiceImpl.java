package com.rainbowforest.paymentservice.service;

import com.rainbowforest.paymentservice.client.OrderClient;
import com.rainbowforest.paymentservice.domain.Payment;
import com.rainbowforest.paymentservice.domain.PaymentLog;
import com.rainbowforest.paymentservice.dto.OrderPaymentSyncRequest;
import com.rainbowforest.paymentservice.dto.PaymentRequest;
import com.rainbowforest.paymentservice.dto.PaymentResponse;
import com.rainbowforest.paymentservice.repository.PaymentLogRepository;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import com.rainbowforest.paymentservice.util.VnpaySignatureUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private static final ZoneId VNPAY_ZONE_ID = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final OrderClient orderClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${vnpay.tmnCode}")
    private String tmnCode;
    @Value("${vnpay.hashSecret}")
    private String hashSecret;
    @Value("${vnpay.payUrl}")
    private String payUrl;
    @Value("${vnpay.returnUrl}")
    private String returnUrl;
    @Value("${vnpay.version}")
    private String version;
    @Value("${vnpay.command}")
    private String command;
    @Value("${vnpay.orderType}")
    private String orderType;
    @Value("${vnpay.locale}")
    private String locale;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        if (request == null || request.getOrderId() == null) {
            throw new RuntimeException("Order id is required");
        }

        Map<String, Object> orderData;
        try {
            orderData = orderClient.getOrderPaymentDetails(request.getOrderId());
        } catch (Exception exception) {
            log.error("Failed to fetch order details for ID: {}", request.getOrderId(), exception);
            throw new RuntimeException("Could not verify order details for payment creation");
        }

        if (orderData == null) {
            throw new RuntimeException("Order not found");
        }

        String orderStatus = (String) orderData.get("status");
        String paymentStatus = (String) orderData.get("paymentStatus");
        if (!isOrderEligibleForPayment(orderStatus, paymentStatus)) {
            throw new RuntimeException("Order is not in a valid state for payment. Current status: " + orderStatus);
        }

        Object finalAmountObj = orderData.get("finalAmount");
        if (finalAmountObj == null) {
            throw new RuntimeException("Order amount is missing");
        }
        BigDecimal finalAmount = new BigDecimal(finalAmountObj.toString());

        Optional<Payment> existingOpt = paymentRepository.findByOrderId(request.getOrderId());
        if (existingOpt.isPresent()) {
            Payment existingPayment = existingOpt.get();
            String existingStatus = String.valueOf(existingPayment.getStatus()).toUpperCase(Locale.ROOT);

            if (Set.of("SUCCESS", "REFUNDED").contains(existingStatus)) {
                throw new RuntimeException("Payment already completed for order: " + request.getOrderId());
            }
        }

        Payment payment = existingOpt.orElseGet(Payment::new);
        payment.setOrderId(request.getOrderId());
        payment.setUserId(resolveUserId(request.getUserId(), orderData));
        payment.setAmount(finalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("PENDING");
        payment.setFailureReason(null);
        payment.setPaidAt(null);
        payment.setExpiredAt(null);
        payment.setProviderTransactionNo(null);
        payment.setResponseCode(null);
        payment.setTransactionStatus(null);
        payment.setBankCode(null);
        payment.setBankTransactionNo(null);
        payment.setCardType(null);

        String txnRef = "TXN" + request.getOrderId() + "_" + System.currentTimeMillis();
        payment.setTxnRef(txnRef);
        payment.setProvider("VNPAY");

        payment = paymentRepository.save(payment);
        paymentLogRepository.save(new PaymentLog(payment, "CREATE", "Payment initialized"));

        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            String paymentUrl = generateVNPayUrl(payment, request.getIpAddress());
            payment.setPaymentUrl(paymentUrl);
            paymentRepository.save(payment);
            return buildResponse(payment);
        }

        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            paymentLogRepository.save(new PaymentLog(payment, "STATUS_UPDATE", "COD auto marked success"));
            sendPaymentEvent(payment);
            return buildResponse(payment);
        }

        throw new RuntimeException("Unsupported payment method: " + request.getPaymentMethod());
    }

    private String generateVNPayUrl(Payment payment, String ipAddress) {
        String vnp_OrderInfo = "Thanh toan don hang " + payment.getOrderId();
        String vnp_IpAddr = (ipAddress != null && !ipAddress.isBlank()) ? ipAddress : "127.0.0.1";

        long amount = payment.getAmount().multiply(new BigDecimal(100)).longValue();
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", version);
        vnp_Params.put("vnp_Command", command);
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", payment.getTxnRef());
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", locale);
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        ZonedDateTime nowInVietnam = ZonedDateTime.now(VNPAY_ZONE_ID);
        String vnp_CreateDate = nowInVietnam.format(VNPAY_DATE_FORMATTER);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        ZonedDateTime expireAtInVietnam = nowInVietnam.plusMinutes(15);
        String vnp_ExpireDate = expireAtInVietnam.format(VNPAY_DATE_FORMATTER);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        payment.setExpiredAt(expireAtInVietnam.toLocalDateTime());

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = VnpaySignatureUtil.hmacSHA512(hashSecret, hashData.toString());
        return payUrl + "?" + query + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Override
    public PaymentResponse getPaymentStatus(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return buildResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentStatusByTxnRef(String txnRef) {
        Payment payment = paymentRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        syncOrderPaymentStatusIfNeeded(payment, "STATUS_QUERY");
        return buildResponse(payment);
    }

    @Override
    @Transactional
    public void handleVNPayIPN(Map<String, String> params) {
        processVNPayCallback(params, "IPN");
    }

    @Override
    @Transactional
    public PaymentResponse handleVNPayReturn(Map<String, String> params) {
        Payment payment = processVNPayCallback(params, "RETURN");
        return buildResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse verifyVNPayReturn(Map<String, String> params) {
        Payment payment = processVNPayCallback(params, "VERIFY_RETURN");
        return buildResponse(payment);
    }

    private Payment processVNPayCallback(Map<String, String> params, String source) {
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            throw new RuntimeException("Invalid Checksum");
        }

        Map<String, String> signParams = new HashMap<>(params);
        signParams.remove("vnp_SecureHashType");
        signParams.remove("vnp_SecureHash");

        String signValue = VnpaySignatureUtil.hashAllFields(signParams, hashSecret);
        boolean signatureValid = signValue.equalsIgnoreCase(secureHash);
        if (!signatureValid) {
            log.error(
                    "VNPay invalid checksum. source={}, txnRef={}, providedHash={}, computedHash={}",
                    source,
                    params.get("vnp_TxnRef"),
                    abbreviateSignature(secureHash),
                    abbreviateSignature(signValue)
            );
            throw new RuntimeException("Invalid Checksum");
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String bankCode = params.get("vnp_BankCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankTranNo = params.get("vnp_BankTranNo");
        String cardType = params.get("vnp_CardType");
        String transactionStatus = params.get("vnp_TransactionStatus");

        Payment payment = paymentRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        long vnpAmount = Long.parseLong(params.get("vnp_Amount"));
        BigDecimal callbackAmount = BigDecimal.valueOf(vnpAmount).divide(BigDecimal.valueOf(100));
        BigDecimal expectedAmount = payment.getAmount();
        if (callbackAmount.compareTo(expectedAmount) != 0) {
            log.error(
                    "VNPay invalid amount. source={}, txnRef={}, orderId={}, expectedAmount={}, callbackAmount={}",
                    source,
                    txnRef,
                    payment.getOrderId(),
                    expectedAmount,
                    callbackAmount
            );
            throw new RuntimeException("Invalid Amount");
        }

        payment.setResponseCode(responseCode);
        payment.setTransactionStatus(transactionStatus);
        payment.setTransactionId(transactionNo);
        payment.setProviderTransactionNo(transactionNo);
        payment.setBankCode(bankCode);
        payment.setBankTransactionNo(bankTranNo);
        payment.setCardType(cardType);

        String targetStatus = resolveCallbackStatus(responseCode, transactionStatus);

        log.info(
                "VNPay callback validated. source={}, orderId={}, paymentId={}, txnRef={}, signatureValid={}, expectedAmount={}, callbackAmount={}, responseCode={}, transactionStatus={}, currentStatus={}, targetStatus={}",
                source,
                payment.getOrderId(),
                payment.getId(),
                txnRef,
                signatureValid,
                expectedAmount,
                callbackAmount,
                responseCode,
                transactionStatus,
                payment.getStatus(),
                targetStatus
        );

        boolean alreadyProcessed = isTerminalPaymentStatus(payment.getStatus());
        if (!alreadyProcessed) {
            payment.setStatus(targetStatus);
            if ("SUCCESS".equals(targetStatus)) {
                payment.setPaidAt(payment.getPaidAt() != null ? payment.getPaidAt() : LocalDateTime.now(VNPAY_ZONE_ID));
                payment.setFailureReason(null);
            } else if ("CANCELLED".equals(targetStatus)) {
                payment.setFailureReason(buildFailureReason("VNPay transaction cancelled", responseCode, transactionStatus));
            } else {
                payment.setFailureReason(buildFailureReason("VNPay transaction failed", responseCode, transactionStatus));
            }
        } else {
            log.info(
                    "VNPay callback duplicate detected. source={}, orderId={}, txnRef={}, persistedStatus={}",
                    source,
                    payment.getOrderId(),
                    txnRef,
                    payment.getStatus()
            );
        }

        paymentRepository.save(payment);
        paymentLogRepository.save(new PaymentLog(
                payment,
                source + "_RECEIVE",
                "responseCode=" + responseCode + ", transactionStatus=" + transactionStatus + ", txnRef=" + txnRef
        ));

        syncOrderPaymentStatusIfNeeded(payment, source);

        if (!alreadyProcessed) {
            sendPaymentEvent(payment);
        }

        log.info(
                "VNPay callback processed. source={}, orderId={}, txnRef={}, savedPaymentStatus={}, paidAt={}, transactionId={}, bankCode={}",
                source,
                payment.getOrderId(),
                txnRef,
                payment.getStatus(),
                payment.getPaidAt(),
                payment.getTransactionId(),
                payment.getBankCode()
        );

        return payment;
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
            }
        }
    }

    private void sendPaymentEvent(Payment payment) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", payment.getOrderId());
        payload.put("status", payment.getStatus());
        payload.put("paymentMethod", payment.getPaymentMethod());

        Map<String, Object> event = new HashMap<>();
        event.put("eventId", java.util.UUID.randomUUID().toString());
        event.put("eventType", "PAYMENT_SUCCESS");
        event.put("payload", payload);

        try {
            kafkaTemplate.send("payment-events", String.valueOf(payment.getOrderId()), event);
        } catch (Exception exception) {
            log.error("Failed to publish payment event for order {}", payment.getOrderId(), exception);
        }
    }

    private void syncOrderPaymentStatusIfNeeded(Payment payment, String source) {
        if (!isTerminalPaymentStatus(payment.getStatus())) {
            return;
        }

        String orderPaymentStatus = mapOrderPaymentStatus(payment.getStatus());
        if (orderPaymentStatus == null) {
            return;
        }

        OrderPaymentSyncRequest request = OrderPaymentSyncRequest.builder()
                .paymentStatus(orderPaymentStatus)
                .orderStatus(resolveOrderStatusForPayment(payment))
                .paymentMethod(payment.getPaymentMethod())
                .txnRef(payment.getTxnRef())
                .transactionId(payment.getTransactionId())
                .providerTransactionNo(payment.getProviderTransactionNo())
                .bankCode(payment.getBankCode())
                .responseCode(payment.getResponseCode())
                .transactionStatus(payment.getTransactionStatus())
                .failureReason(payment.getFailureReason())
                .paidAt(payment.getPaidAt())
                .build();

        try {
            Map<String, Object> syncResponse = orderClient.syncOrderPaymentStatus(payment.getOrderId(), request);
            log.info(
                    "Synced order payment state. source={}, orderId={}, txnRef={}, paymentStatus={}, orderResponse={}",
                    source,
                    payment.getOrderId(),
                    payment.getTxnRef(),
                    orderPaymentStatus,
                    syncResponse
            );
        } catch (Exception exception) {
            log.error(
                    "Failed to sync order payment state. source={}, orderId={}, txnRef={}, paymentStatus={}",
                    source,
                    payment.getOrderId(),
                    payment.getTxnRef(),
                    orderPaymentStatus,
                    exception
            );
        }
    }

    private boolean isTerminalPaymentStatus(String status) {
        if (status == null || status.isBlank()) {
            return false;
        }
        return Set.of("SUCCESS", "FAILED", "CANCELLED", "REFUNDED").contains(status.trim().toUpperCase(Locale.ROOT));
    }

    private String resolveCallbackStatus(String responseCode, String transactionStatus) {
        boolean success = "00".equals(responseCode)
                && (transactionStatus == null || transactionStatus.isBlank() || "00".equals(transactionStatus));
        if (success) {
            return "SUCCESS";
        }
        if ("24".equals(responseCode) || "02".equals(transactionStatus)) {
            return "CANCELLED";
        }
        return "FAILED";
    }

    private String mapOrderPaymentStatus(String paymentStatus) {
        if (paymentStatus == null || paymentStatus.isBlank()) {
            return null;
        }
        return switch (paymentStatus.trim().toUpperCase(Locale.ROOT)) {
            case "SUCCESS" -> "PAID";
            case "FAILED" -> "FAILED";
            case "CANCELLED" -> "CANCELLED";
            case "REFUNDED" -> "REFUNDED";
            default -> null;
        };
    }

    private String resolveOrderStatusForPayment(Payment payment) {
        if (payment == null) {
            return null;
        }

        String paymentMethod = payment.getPaymentMethod() == null
                ? ""
                : payment.getPaymentMethod().trim().toUpperCase(Locale.ROOT);
        String paymentStatus = payment.getStatus() == null
                ? ""
                : payment.getStatus().trim().toUpperCase(Locale.ROOT);

        if ("VNPAY".equals(paymentMethod) && "SUCCESS".equals(paymentStatus)) {
            return "CONFIRMED";
        }

        return null;
    }

    private String buildFailureReason(String prefix, String responseCode, String transactionStatus) {
        return prefix + " (responseCode=" + responseCode + ", transactionStatus=" + transactionStatus + ")";
    }

    private String abbreviateSignature(String signature) {
        if (signature == null || signature.isBlank()) {
            return "<empty>";
        }
        if (signature.length() <= 12) {
            return signature;
        }
        return signature.substring(0, 6) + "..." + signature.substring(signature.length() - 6);
    }

    private boolean isOrderEligibleForPayment(String orderStatus, String paymentStatus) {
        if (paymentStatus != null) {
            String normalizedPaymentStatus = paymentStatus.trim().toUpperCase(Locale.ROOT);
            if (Set.of("PAID", "SUCCESS", "COMPLETED", "REFUNDED").contains(normalizedPaymentStatus)) {
                return false;
            }
        }

        if (orderStatus == null || orderStatus.isBlank()) {
            return true;
        }

        String normalizedOrderStatus = orderStatus.trim().toUpperCase(Locale.ROOT);
        return !Set.of("CANCELLED", "COMPLETED", "REFUNDED").contains(normalizedOrderStatus);
    }

    private Long resolveUserId(Long requestUserId, Map<String, Object> orderData) {
        if (requestUserId != null) {
            return requestUserId;
        }

        Object orderUserId = orderData.get("userId");
        if (orderUserId == null) {
            throw new RuntimeException("User id is required");
        }
        return Long.valueOf(orderUserId.toString());
    }

    private PaymentResponse buildResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paymentUrl(payment.getPaymentUrl())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
