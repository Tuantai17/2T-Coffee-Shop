package com.rainbowforest.orderservice.dto.catalog;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CatalogOptionDto {
    private Long id;
    private String name;
    private BigDecimal priceAdjustment;
}
