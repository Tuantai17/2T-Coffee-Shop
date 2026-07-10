package com.rainbowforest.inventoryservice.controller;

import com.rainbowforest.inventoryservice.dto.InventoryAdjustmentRequest;
import com.rainbowforest.inventoryservice.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventory")
public class AdminInventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping("/import")
    public ResponseEntity<Void> importInventory(@RequestBody InventoryAdjustmentRequest request) {
        inventoryService.importInventory(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/adjust")
    public ResponseEntity<Void> adjustInventory(@RequestBody InventoryAdjustmentRequest request) {
        inventoryService.adjustInventory(request);
        return ResponseEntity.ok().build();
    }
}
