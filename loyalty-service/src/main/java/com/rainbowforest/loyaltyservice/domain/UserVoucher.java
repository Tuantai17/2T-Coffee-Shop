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

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getOrderId() { return orderId; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setAcquiredAt(LocalDateTime acquiredAt) { this.acquiredAt = acquiredAt; }
    public LocalDateTime getAcquiredAt() { return acquiredAt; }
    public void setCode(String code) { this.code = code; }
    public String getCode() { return code; }
    public void setVoucherDefinition(VoucherDefinition voucherDefinition) { this.voucherDefinition = voucherDefinition; }
    public VoucherDefinition getVoucherDefinition() { return voucherDefinition; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class UserVoucherBuilder {
        private Long id;
        private Long userId;
        private VoucherDefinition voucherDefinition;
        private String code;
        private String status;
        private LocalDateTime acquiredAt;
        private LocalDateTime usedAt;
        private Long orderId;
        private LocalDateTime expiresAt;

        public UserVoucherBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserVoucherBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public UserVoucherBuilder voucherDefinition(VoucherDefinition voucherDefinition) {
            this.voucherDefinition = voucherDefinition;
            return this;
        }

        public UserVoucherBuilder code(String code) {
            this.code = code;
            return this;
        }

        public UserVoucherBuilder status(String status) {
            this.status = status;
            return this;
        }

        public UserVoucherBuilder acquiredAt(LocalDateTime acquiredAt) {
            this.acquiredAt = acquiredAt;
            return this;
        }

        public UserVoucherBuilder usedAt(LocalDateTime usedAt) {
            this.usedAt = usedAt;
            return this;
        }

        public UserVoucherBuilder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }

        public UserVoucherBuilder expiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public UserVoucher build() {
            UserVoucher obj = new UserVoucher();
            obj.setId(this.id);
            obj.setUserId(this.userId);
            obj.setVoucherDefinition(this.voucherDefinition);
            obj.setCode(this.code);
            obj.setStatus(this.status);
            obj.setAcquiredAt(this.acquiredAt);
            obj.setUsedAt(this.usedAt);
            obj.setOrderId(this.orderId);
            obj.setExpiresAt(this.expiresAt);
            return obj;
        }
    }
    
    public static UserVoucherBuilder builder() { return new UserVoucherBuilder(); }
}
