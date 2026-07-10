package com.rainbowforest.productcatalogservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping(value = "/internal/orders/products/{productId}/usage")
    Map<String, Object> checkProductUsage(@PathVariable("productId") Long productId);

}
