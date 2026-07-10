package com.rainbowforest.orderservice.feignclient;

import com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class InventoryClientFallback implements InventoryClient {

    @Override
    public void reserveInventory(List<InventoryAdjustmentRequest> requests) {
        System.err.println("CIRCUIT BREAKER FALLBACK: reserveInventory failed due to Inventory Service being down or slow.");
    }

    @Override
    public void commitReservation(Long orderId) {
        System.err.println("CIRCUIT BREAKER FALLBACK: commitReservation failed for order " + orderId + ". Will retry later via dead letter queue.");
    }

    @Override
    public void releaseReservation(Long orderId) {
        System.err.println("CIRCUIT BREAKER FALLBACK: releaseReservation failed for order " + orderId + ".");
    }
}
