package com.rainbowforest.inventoryservice.controller;

import com.rainbowforest.inventoryservice.dto.InventoryAdjustmentRequest;
import com.rainbowforest.inventoryservice.dto.InventoryResponse;
import com.rainbowforest.inventoryservice.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internal/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/products/{productId}")
    public ResponseEntity<InventoryResponse> getProductInventory(
            @PathVariable Long productId, 
            @RequestParam(required = false) Long variantId) {
        return ResponseEntity.ok(inventoryService.getProductInventory(productId, variantId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<Void> reserveInventory(@RequestBody List<InventoryAdjustmentRequest> requests) {
        inventoryService.reserveInventory(requests);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reservations/{orderId}/commit")
    public ResponseEntity<Void> commitReservation(@PathVariable Long orderId) {
        inventoryService.commitReservation(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reservations/{orderId}/release")
    public ResponseEntity<Void> releaseReservation(@PathVariable Long orderId) {
        inventoryService.releaseReservation(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/restock")
    public ResponseEntity<Void> restockInventory(@PathVariable Long orderId) {
        inventoryService.restockInventory(orderId);
        return ResponseEntity.ok().build();
    }
}
