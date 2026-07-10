package com.rainbowforest.deliveryservice.dto;

import lombok.Data;

@Data
public class DeliveryRequest {
    private Long orderId;
    private String receiverName;
    private String phone;
    private String address;
    private String district;
    private String ward;
}
