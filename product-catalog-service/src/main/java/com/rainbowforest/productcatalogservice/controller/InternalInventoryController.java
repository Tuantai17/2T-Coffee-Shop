package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.InventoryAdjustmentRequest;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/internal/inventory")
public class InternalInventoryController {

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/adjust")
    public ResponseEntity<Void> adjustInventory(@RequestBody InventoryAdjustmentRequest request) {
        Optional<Product> optProduct = productRepository.findById(request.getProductId());
        if (optProduct.isPresent()) {
            Product product = optProduct.get();
            if (product.getAvailability() >= request.getQuantity()) {
                product.setAvailability(product.getAvailability() - request.getQuantity());
                productRepository.save(product);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build(); // Not enough inventory
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/damaged")
    public ResponseEntity<Void> reportDamagedInventory(@RequestBody InventoryAdjustmentRequest request) {
        Optional<Product> optProduct = productRepository.findById(request.getProductId());
        if (optProduct.isPresent()) {
            Product product = optProduct.get();
            // Typically damaged goods are removed from available/reserved inventory and marked as damaged
            // For now, we simulate this by saving
            productRepository.save(product);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/release")
    public ResponseEntity<Void> releaseInventory(@RequestBody InventoryAdjustmentRequest request) {
        Optional<Product> optProduct = productRepository.findById(request.getProductId());
        if (optProduct.isPresent()) {
            Product product = optProduct.get();
            // Release means adding back to availability
            product.setAvailability(product.getAvailability() + request.getQuantity());
            productRepository.save(product);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/reserve")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> reserveInventory(@RequestBody java.util.List<InventoryAdjustmentRequest> requests) {
        for (InventoryAdjustmentRequest request : requests) {
            Optional<Product> optProduct = productRepository.findById(request.getProductId());
            if (optProduct.isPresent()) {
                Product product = optProduct.get();
                if (product.getAvailability() >= request.getQuantity()) {
                    product.setAvailability(product.getAvailability() - request.getQuantity());
                    productRepository.save(product);
                } else {
                    // Not enough inventory, rollback transaction by throwing exception
                    throw new IllegalArgumentException("Sản phẩm " + product.getProductName() + " không đủ số lượng tồn kho");
                }
            } else {
                throw new IllegalArgumentException("Không tìm thấy sản phẩm có ID: " + request.getProductId());
            }
        }
        return ResponseEntity.ok().build();
    }
}
