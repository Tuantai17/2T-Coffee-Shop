package com.rainbowforest.revenueservice.controller;

import com.rainbowforest.revenueservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/revenue")
public class RevenueController {

    @Autowired
    private DailyRevenueRepository dailyRevenueRepository;

    @Autowired
    private ProductStatRepository productStatRepository;

    @Autowired
    private ToppingStatRepository toppingStatRepository;

    @Autowired
    private InteractionStatRepository interactionStatRepository;

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyRevenue() {
        return ResponseEntity.ok(dailyRevenueRepository.findTop30ByOrderByDateDesc());
    }

    @GetMapping("/products/top")
    public ResponseEntity<?> getTopProducts() {
        return ResponseEntity.ok(productStatRepository.findTop10ByOrderByTotalQuantityDesc());
    }

    @GetMapping("/toppings/top")
    public ResponseEntity<?> getTopToppings() {
        return ResponseEntity.ok(toppingStatRepository.findTop10ByOrderByTotalQuantityDesc());
    }

    @GetMapping("/interactions")
    public ResponseEntity<?> getInteractions() {
        return ResponseEntity.ok(interactionStatRepository.findTop30ByOrderByDateDesc());
    }
}
