package com.rainbowforest.deliveryservice.service;

import com.rainbowforest.deliveryservice.dto.DeliveryRequest;
import com.rainbowforest.deliveryservice.dto.DeliveryResponse;

import java.math.BigDecimal;

public interface DeliveryService {
    BigDecimal previewFee(String district);
    DeliveryResponse createDelivery(DeliveryRequest request);
    void updateStatus(Long id, String status);
}
