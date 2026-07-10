package com.rainbowforest.revenueservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_revenue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenue {
    @Id
    private LocalDate date;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal deliveryRevenue;
    private BigDecimal pickupRevenue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
