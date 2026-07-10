package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_definitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDefinition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 30)
    private String type; // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, FREE_ITEM

    @Column(name = "discount_amount")
    private Long discountAmount;

    @Column(name = "discount_percentage")
    private Integer discountPercentage;

    @Column(name = "max_discount_amount")
    private Long maxDiscountAmount;

    @Column(name = "min_order_value", nullable = false)
    private Long minOrderValue;

    @Column(name = "required_tier_code", length = 30)
    private String requiredTierCode;

    @Column(name = "points_required", nullable = false)
    private Long pointsRequired;

    @Column(name = "max_claims_per_user", nullable = false)
    private Integer maxClaimsPerUser;

    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @Column(name = "claimed_quantity", nullable = false)
    private Integer claimedQuantity;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "bg_color", length = 50)
    private String bgColor;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_to")
    private LocalDateTime validTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (minOrderValue == null) minOrderValue = 0L;
        if (pointsRequired == null) pointsRequired = 0L;
        if (maxClaimsPerUser == null) maxClaimsPerUser = 1;
        if (claimedQuantity == null) claimedQuantity = 0;
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
