package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/internal/orders")
public class OrderInternalController {

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/products/{productId}/usage")
    public ResponseEntity<Map<String, Object>> checkProductUsage(@PathVariable("productId") Long productId) {
        boolean hasOrders = itemRepository.existsByProductId(productId);
        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("hasOrders", hasOrders);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
