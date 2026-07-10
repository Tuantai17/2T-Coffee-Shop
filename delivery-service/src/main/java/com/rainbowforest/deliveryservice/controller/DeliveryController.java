package com.rainbowforest.deliveryservice.controller;

import com.rainbowforest.deliveryservice.dto.DeliveryRequest;
import com.rainbowforest.deliveryservice.dto.DeliveryResponse;
import com.rainbowforest.deliveryservice.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/internal/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/preview")
    public ResponseEntity<BigDecimal> previewFee(@RequestBody Map<String, String> payload) {
        String district = payload.get("district");
        return ResponseEntity.ok(deliveryService.previewFee(district));
    }

    @PostMapping("/create")
    public ResponseEntity<DeliveryResponse> createDelivery(@RequestBody DeliveryRequest request) {
        return ResponseEntity.ok(deliveryService.createDelivery(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        deliveryService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
