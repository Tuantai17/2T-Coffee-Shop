package com.rainbowforest.deliveryservice.service;

import com.rainbowforest.deliveryservice.domain.Delivery;
import com.rainbowforest.deliveryservice.dto.DeliveryRequest;
import com.rainbowforest.deliveryservice.dto.DeliveryResponse;
import com.rainbowforest.deliveryservice.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.store.district:Quận 1}")
    private String storeDistrict;

    @Value("${app.store.base-fee:15000}")
    private BigDecimal baseFee;

    @Value("${app.store.outside-fee:35000}")
    private BigDecimal outsideFee;

    @Override
    public BigDecimal previewFee(String district) {
        if (district == null || district.isBlank()) return outsideFee;
        if (storeDistrict.equalsIgnoreCase(district.trim())) {
            return baseFee;
        }
        return outsideFee;
    }

    @Override
    @Transactional
    public DeliveryResponse createDelivery(DeliveryRequest request) {
        if (deliveryRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new RuntimeException("Delivery already exists for order: " + request.getOrderId());
        }

        Delivery delivery = new Delivery();
        delivery.setOrderId(request.getOrderId());
        delivery.setReceiverName(request.getReceiverName());
        delivery.setPhone(request.getPhone());
        delivery.setAddress(request.getAddress());
        delivery.setDistrict(request.getDistrict());
        delivery.setWard(request.getWard());
        
        BigDecimal fee = previewFee(request.getDistrict());
        delivery.setFee(fee);
        delivery.setStatus("PENDING");
        
        delivery = deliveryRepository.save(delivery);

        return DeliveryResponse.builder()
                .deliveryId(delivery.getId())
                .orderId(delivery.getOrderId())
                .fee(delivery.getFee())
                .status(delivery.getStatus())
                .district(delivery.getDistrict())
                .address(delivery.getAddress())
                .build();
    }

    @Override
    @Transactional
    public void updateStatus(Long id, String status) {
        Delivery delivery = deliveryRepository.findById(id).orElseThrow();
        delivery.setStatus(status);
        deliveryRepository.save(delivery);

        Map<String, Object> event = new HashMap<>();
        event.put("orderId", delivery.getOrderId());
        event.put("status", status);
        kafkaTemplate.send("delivery-events", String.valueOf(delivery.getOrderId()), event);
    }
}
