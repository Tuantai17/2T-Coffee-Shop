package com.rainbowforest.orderservice.dto.catalog;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CatalogProductDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private String imageUrl;
    private Integer quantity; // availability
    
    private List<CatalogVariantDto> variants;
    private List<CatalogOptionGroupDto> optionGroups;
    private List<CatalogToppingDto> toppings;
}
