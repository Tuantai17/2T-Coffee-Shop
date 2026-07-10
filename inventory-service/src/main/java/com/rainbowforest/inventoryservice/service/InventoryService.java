package com.rainbowforest.inventoryservice.service;

import com.rainbowforest.inventoryservice.dto.InventoryAdjustmentRequest;
import com.rainbowforest.inventoryservice.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {
    InventoryResponse getProductInventory(Long productId, Long variantId);
    void reserveInventory(List<InventoryAdjustmentRequest> requests);
    void commitReservation(Long orderId);
    void releaseReservation(Long orderId);
    void restockInventory(Long orderId);
    void adjustInventory(InventoryAdjustmentRequest request);
    void importInventory(InventoryAdjustmentRequest request);
}
