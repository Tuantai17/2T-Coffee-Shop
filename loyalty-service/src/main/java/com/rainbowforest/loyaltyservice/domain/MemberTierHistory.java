package com.rainbowforest.loyaltyservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_tier_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberTierHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "old_tier_code", length = 30)
    private String oldTierCode;

    @Column(name = "new_tier_code", nullable = false, length = 30)
    private String newTierCode;

    @Column(name = "completed_orders_6_months", nullable = false)
    private Integer completedOrders6Months;

    @Column(name = "eligible_spending_6_months", nullable = false)
    private Long eligibleSpending6Months;

    @Column(name = "reason", length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setReason(String reason) { this.reason = reason; }
    public String getReason() { return reason; }
    public void setEligibleSpending6Months(Long eligibleSpending6Months) { this.eligibleSpending6Months = eligibleSpending6Months; }
    public Long getEligibleSpending6Months() { return eligibleSpending6Months; }
    public void setCompletedOrders6Months(Integer completedOrders6Months) { this.completedOrders6Months = completedOrders6Months; }
    public Integer getCompletedOrders6Months() { return completedOrders6Months; }
    public void setNewTierCode(String newTierCode) { this.newTierCode = newTierCode; }
    public String getNewTierCode() { return newTierCode; }
    public void setOldTierCode(String oldTierCode) { this.oldTierCode = oldTierCode; }
    public String getOldTierCode() { return oldTierCode; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUserId() { return userId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class MemberTierHistoryBuilder {
        private Long id;
        private Long userId;
        private String oldTierCode;
        private String newTierCode;
        private Integer completedOrders6Months;
        private Long eligibleSpending6Months;
        private String reason;
        private LocalDateTime changedAt;

        public MemberTierHistoryBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MemberTierHistoryBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public MemberTierHistoryBuilder oldTierCode(String oldTierCode) {
            this.oldTierCode = oldTierCode;
            return this;
        }

        public MemberTierHistoryBuilder newTierCode(String newTierCode) {
            this.newTierCode = newTierCode;
            return this;
        }

        public MemberTierHistoryBuilder completedOrders6Months(Integer completedOrders6Months) {
            this.completedOrders6Months = completedOrders6Months;
            return this;
        }

        public MemberTierHistoryBuilder eligibleSpending6Months(Long eligibleSpending6Months) {
            this.eligibleSpending6Months = eligibleSpending6Months;
            return this;
        }

        public MemberTierHistoryBuilder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public MemberTierHistoryBuilder changedAt(LocalDateTime changedAt) {
            this.changedAt = changedAt;
            return this;
        }

        public MemberTierHistory build() {
            MemberTierHistory obj = new MemberTierHistory();
            obj.setId(this.id);
            obj.setUserId(this.userId);
            obj.setOldTierCode(this.oldTierCode);
            obj.setNewTierCode(this.newTierCode);
            obj.setCompletedOrders6Months(this.completedOrders6Months);
            obj.setEligibleSpending6Months(this.eligibleSpending6Months);
            obj.setReason(this.reason);
            obj.setChangedAt(this.changedAt);
            return obj;
        }
    }
    
    public static MemberTierHistoryBuilder builder() { return new MemberTierHistoryBuilder(); }
}
