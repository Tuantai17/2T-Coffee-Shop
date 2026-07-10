package com.rainbowforest.orderservice.dto.catalog;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CatalogVariantDto {
    private Long id;
    private String sizeName;
    private BigDecimal priceAdjustment;
}
