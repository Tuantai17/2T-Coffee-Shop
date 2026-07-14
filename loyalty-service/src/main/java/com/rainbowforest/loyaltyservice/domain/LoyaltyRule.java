package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // Tích điểm, Trừ điểm

    @Column(name = "rule_condition", nullable = false)
    private String condition;

    @Column(nullable = false)
    private Long point;

    @Column(nullable = false)
    private Boolean status; // true: Hoạt động, false: Tạm dừng

    @Column(length = 50)
    private String source;

    @Column(name = "is_deleted", columnDefinition = "boolean default false")
    private Boolean isDeleted = false;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isDeleted == null) this.isDeleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getCreatedBy() { return createdBy; }
    public void setSource(String source) { this.source = source; }
    public String getSource() { return source; }
    public void setStatus(Boolean status) { this.status = status; }
    public Boolean getStatus() { return status; }
    public void setPoint(Long point) { this.point = point; }
    public Long getPoint() { return point; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getCondition() { return condition; }
    public void setType(String type) { this.type = type; }
    public String getType() { return type; }
    public void setName(String name) { this.name = name; }
    public String getName() { return name; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class LoyaltyRuleBuilder {
        private Long id;
        private String name;
        private String type;
        private String condition;
        private Long point;
        private Boolean status;
        private String source;
        private String createdBy;
        private String updatedBy;
        private LocalDateTime updatedAt;
        private LocalDateTime createdAt;

        public LoyaltyRuleBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public LoyaltyRuleBuilder name(String name) {
            this.name = name;
            return this;
        }

        public LoyaltyRuleBuilder type(String type) {
            this.type = type;
            return this;
        }

        public LoyaltyRuleBuilder condition(String condition) {
            this.condition = condition;
            return this;
        }

        public LoyaltyRuleBuilder point(Long point) {
            this.point = point;
            return this;
        }

        public LoyaltyRuleBuilder status(Boolean status) {
            this.status = status;
            return this;
        }

        public LoyaltyRuleBuilder source(String source) {
            this.source = source;
            return this;
        }

        public LoyaltyRuleBuilder createdBy(String createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public LoyaltyRuleBuilder updatedBy(String updatedBy) {
            this.updatedBy = updatedBy;
            return this;
        }

        public LoyaltyRuleBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public LoyaltyRuleBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public LoyaltyRule build() {
            LoyaltyRule obj = new LoyaltyRule();
            obj.setId(this.id);
            obj.setName(this.name);
            obj.setType(this.type);
            obj.setCondition(this.condition);
            obj.setPoint(this.point);
            obj.setStatus(this.status);
            obj.setSource(this.source);
            obj.setCreatedBy(this.createdBy);
            obj.setUpdatedBy(this.updatedBy);
            obj.setUpdatedAt(this.updatedAt);
            obj.setCreatedAt(this.createdAt);
            return obj;
        }
    }
    
    public static LoyaltyRuleBuilder builder() { return new LoyaltyRuleBuilder(); }
    public Boolean getIsDeleted() { return this.isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}
