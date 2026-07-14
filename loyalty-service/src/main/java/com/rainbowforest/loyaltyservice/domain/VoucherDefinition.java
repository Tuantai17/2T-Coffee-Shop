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

    public String getCode() { return code; }
    public String getName() { return name; }
    public Boolean getActive() { return active; }
    public LocalDateTime getValidFrom() { return validFrom; }
    public LocalDateTime getValidTo() { return validTo; }
    public Integer getTotalQuantity() { return totalQuantity; }
    public Integer getClaimedQuantity() { return claimedQuantity; }
    public Long getMinOrderValue() { return minOrderValue; }
    public String getType() { return type; }
    public Long getDiscountAmount() { return discountAmount; }
    public Integer getDiscountPercentage() { return discountPercentage; }
    public Long getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setValidTo(LocalDateTime validTo) { this.validTo = validTo; }
    public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getImageUrl() { return imageUrl; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }
    public String getBgColor() { return bgColor; }
    public void setActive(Boolean active) { this.active = active; }
    public void setClaimedQuantity(Integer claimedQuantity) { this.claimedQuantity = claimedQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    public void setMaxClaimsPerUser(Integer maxClaimsPerUser) { this.maxClaimsPerUser = maxClaimsPerUser; }
    public Integer getMaxClaimsPerUser() { return maxClaimsPerUser; }
    public void setPointsRequired(Long pointsRequired) { this.pointsRequired = pointsRequired; }
    public Long getPointsRequired() { return pointsRequired; }
    public void setRequiredTierCode(String requiredTierCode) { this.requiredTierCode = requiredTierCode; }
    public String getRequiredTierCode() { return requiredTierCode; }
    public void setMinOrderValue(Long minOrderValue) { this.minOrderValue = minOrderValue; }
    public void setMaxDiscountAmount(Long maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }
    public void setDiscountPercentage(Integer discountPercentage) { this.discountPercentage = discountPercentage; }
    public void setDiscountAmount(Long discountAmount) { this.discountAmount = discountAmount; }
    public void setType(String type) { this.type = type; }
    public void setDescription(String description) { this.description = description; }
    public String getDescription() { return description; }
    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class VoucherDefinitionBuilder {
        private Long id;
        private String code;
        private String name;
        private String description;
        private String type;
        private Long discountAmount;
        private Integer discountPercentage;
        private Long maxDiscountAmount;
        private Long minOrderValue;
        private String requiredTierCode;
        private Long pointsRequired;
        private Integer maxClaimsPerUser;
        private Integer totalQuantity;
        private Integer claimedQuantity;
        private Boolean active;
        private String bgColor;
        private String imageUrl;
        private LocalDateTime validFrom;
        private LocalDateTime validTo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public VoucherDefinitionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public VoucherDefinitionBuilder code(String code) {
            this.code = code;
            return this;
        }

        public VoucherDefinitionBuilder name(String name) {
            this.name = name;
            return this;
        }

        public VoucherDefinitionBuilder description(String description) {
            this.description = description;
            return this;
        }

        public VoucherDefinitionBuilder type(String type) {
            this.type = type;
            return this;
        }

        public VoucherDefinitionBuilder discountAmount(Long discountAmount) {
            this.discountAmount = discountAmount;
            return this;
        }

        public VoucherDefinitionBuilder discountPercentage(Integer discountPercentage) {
            this.discountPercentage = discountPercentage;
            return this;
        }

        public VoucherDefinitionBuilder maxDiscountAmount(Long maxDiscountAmount) {
            this.maxDiscountAmount = maxDiscountAmount;
            return this;
        }

        public VoucherDefinitionBuilder minOrderValue(Long minOrderValue) {
            this.minOrderValue = minOrderValue;
            return this;
        }

        public VoucherDefinitionBuilder requiredTierCode(String requiredTierCode) {
            this.requiredTierCode = requiredTierCode;
            return this;
        }

        public VoucherDefinitionBuilder pointsRequired(Long pointsRequired) {
            this.pointsRequired = pointsRequired;
            return this;
        }

        public VoucherDefinitionBuilder maxClaimsPerUser(Integer maxClaimsPerUser) {
            this.maxClaimsPerUser = maxClaimsPerUser;
            return this;
        }

        public VoucherDefinitionBuilder totalQuantity(Integer totalQuantity) {
            this.totalQuantity = totalQuantity;
            return this;
        }

        public VoucherDefinitionBuilder claimedQuantity(Integer claimedQuantity) {
            this.claimedQuantity = claimedQuantity;
            return this;
        }

        public VoucherDefinitionBuilder active(Boolean active) {
            this.active = active;
            return this;
        }

        public VoucherDefinitionBuilder bgColor(String bgColor) {
            this.bgColor = bgColor;
            return this;
        }

        public VoucherDefinitionBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public VoucherDefinitionBuilder validFrom(LocalDateTime validFrom) {
            this.validFrom = validFrom;
            return this;
        }

        public VoucherDefinitionBuilder validTo(LocalDateTime validTo) {
            this.validTo = validTo;
            return this;
        }

        public VoucherDefinitionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public VoucherDefinitionBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public VoucherDefinition build() {
            VoucherDefinition obj = new VoucherDefinition();
            obj.setId(this.id);
            obj.setCode(this.code);
            obj.setName(this.name);
            obj.setDescription(this.description);
            obj.setType(this.type);
            obj.setDiscountAmount(this.discountAmount);
            obj.setDiscountPercentage(this.discountPercentage);
            obj.setMaxDiscountAmount(this.maxDiscountAmount);
            obj.setMinOrderValue(this.minOrderValue);
            obj.setRequiredTierCode(this.requiredTierCode);
            obj.setPointsRequired(this.pointsRequired);
            obj.setMaxClaimsPerUser(this.maxClaimsPerUser);
            obj.setTotalQuantity(this.totalQuantity);
            obj.setClaimedQuantity(this.claimedQuantity);
            obj.setActive(this.active);
            obj.setBgColor(this.bgColor);
            obj.setImageUrl(this.imageUrl);
            obj.setValidFrom(this.validFrom);
            obj.setValidTo(this.validTo);
            obj.setCreatedAt(this.createdAt);
            obj.setUpdatedAt(this.updatedAt);
            return obj;
        }
    }
    
    public static VoucherDefinitionBuilder builder() { return new VoucherDefinitionBuilder(); }
}
