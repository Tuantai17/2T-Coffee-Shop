package com.rainbowforest.recommendationservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private static final String REDIS_PRODUCT_SOLD_KEY = "recommendation:product:sold";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @GetMapping("/top-selling")
    public ResponseEntity<?> getTopSellingProducts(@RequestParam(defaultValue = "10") int limit) {
        Set<ZSetOperations.TypedTuple<String>> topProducts = redisTemplate.opsForZSet()
                .reverseRangeWithScores(REDIS_PRODUCT_SOLD_KEY, 0, limit - 1);
        
        if (topProducts == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<Long> productIds = topProducts.stream()
                .map(tuple -> Long.parseLong(tuple.getValue()))
                .collect(Collectors.toList());

        // Ideally we fetch details from product-catalog-service here using ProductClient.
        // For simplicity, we just return the IDs. The frontend can fetch details via catalog API using these IDs.
        return ResponseEntity.ok(productIds);
    }
}
