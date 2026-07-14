package com.rainbowforest.paymentservice.client;

import com.rainbowforest.paymentservice.dto.OrderPaymentSyncRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "order-service", path = "/internal/orders")
public interface OrderClient {

    @GetMapping("/{orderId}/payment-details")
    Map<String, Object> getOrderPaymentDetails(@PathVariable("orderId") Long orderId);

    @PutMapping("/{orderId}/payment-status")
    Map<String, Object> syncOrderPaymentStatus(@PathVariable("orderId") Long orderId,
                                               @RequestBody OrderPaymentSyncRequest request);
}
