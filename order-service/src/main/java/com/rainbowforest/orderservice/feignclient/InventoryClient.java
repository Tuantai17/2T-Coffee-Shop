package com.rainbowforest.orderservice.feignclient;

import com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "inventory-service", fallback = InventoryClientFallback.class)
public interface InventoryClient {

    @PostMapping("/api/internal/inventory/reserve")
    void reserveInventory(@RequestBody List<InventoryAdjustmentRequest> requests);

    @PostMapping("/api/internal/inventory/reservations/{orderId}/commit")
    void commitReservation(@PathVariable("orderId") Long orderId);

    @PostMapping("/api/internal/inventory/reservations/{orderId}/release")
    void releaseReservation(@PathVariable("orderId") Long orderId);
}
