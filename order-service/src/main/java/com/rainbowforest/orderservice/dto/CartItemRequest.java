package com.rainbowforest.orderservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartItemRequest {
    private Long productId;
    private Long variantId;
    private List<Long> optionIds;
    private List<Long> toppingIds;
    private Integer quantity;
    private String note;
}
