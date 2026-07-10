package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_vouchers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVoucher {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voucher_definition_id", nullable = false)
    private VoucherDefinition voucherDefinition;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 30)
    private String status; // AVAILABLE, USED, EXPIRED

    @Column(name = "acquired_at", nullable = false, updatable = false)
    private LocalDateTime acquiredAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        acquiredAt = LocalDateTime.now();
        if (status == null) status = "AVAILABLE";
    }
}
