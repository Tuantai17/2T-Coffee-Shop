package com.rainbowforest.deliveryservice.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DeliveryResponse {
    private Long deliveryId;
    private Long orderId;
    private BigDecimal fee;
    private String status;
    private String district;
    private String address;
}
