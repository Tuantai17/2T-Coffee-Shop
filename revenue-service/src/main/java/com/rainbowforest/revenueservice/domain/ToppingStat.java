package com.rainbowforest.revenueservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "topping_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToppingStat {
    @Id
    private Long toppingId;
    private String toppingName;
    private Long totalQuantity;
    private BigDecimal totalRevenue;
}
