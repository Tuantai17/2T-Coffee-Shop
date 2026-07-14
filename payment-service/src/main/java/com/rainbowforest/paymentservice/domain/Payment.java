package com.rainbowforest.paymentservice.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // COD, VNPAY

    @Column(nullable = false)
    private String status; // PENDING, SUCCESS, FAILED, REFUNDED

    @Column(name = "transaction_id")
    private String transactionId; // Legacy, kept for compatibility if needed, or we can just use txnRef

    @Column(name = "provider")
    private String provider; // VNPAY

    @Column(name = "txn_ref", unique = true)
    private String txnRef; // Mã giao dịch của chúng ta (vnp_TxnRef)

    @Column(name = "provider_transaction_no")
    private String providerTransactionNo; // vnp_TransactionNo

    @Column(name = "response_code")
    private String responseCode; // vnp_ResponseCode

    @Column(name = "transaction_status")
    private String transactionStatus; // vnp_TransactionStatus

    @Column(name = "bank_code")
    private String bankCode; // vnp_BankCode

    @Column(name = "bank_transaction_no")
    private String bankTransactionNo; // vnp_BankTranNo

    @Column(name = "card_type")
    private String cardType; // vnp_CardType

    @Column(name = "payment_url", columnDefinition = "TEXT")
    private String paymentUrl;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
