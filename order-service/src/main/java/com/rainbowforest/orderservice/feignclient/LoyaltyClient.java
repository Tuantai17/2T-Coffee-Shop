package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "loyalty-service")
public interface LoyaltyClient {

    @PostMapping("/api/loyalty/vouchers/preview-checkout")
    Map<String, Object> previewVoucher(@RequestBody Map<String, Object> payload);

    @PostMapping("/api/loyalty/vouchers/consume")
    Map<String, Object> consumeVoucher(@RequestBody Map<String, Object> payload);
}
