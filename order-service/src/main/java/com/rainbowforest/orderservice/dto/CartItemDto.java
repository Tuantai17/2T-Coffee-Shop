package com.rainbowforest.orderservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CartItemDto {
    private String cartItemId; // Hash of product + variant + options + toppings
    private Long productId;
    private String productName;
    private String productImageUrl;
    
    private Long variantId;
    private String variantName;
    private BigDecimal variantPrice;
    
    private List<Long> optionIds;
    private String optionsSnapshot;
    
    private List<Long> toppingIds;
    private String toppingsSnapshot;
    
    private Integer quantity;
    private String note;
    
    private BigDecimal unitPrice;
    private BigDecimal toppingTotal;
    private BigDecimal subTotal;
}
