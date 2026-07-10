package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.dto.catalog.CatalogProductDto;

@FeignClient(name = "product-catalog-service")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public CatalogProductDto getProductById(@PathVariable(value = "id") Long productId);

    @GetMapping(value = "/admin/option-groups")
    public java.util.List<com.rainbowforest.orderservice.dto.catalog.CatalogOptionGroupDto> getAllOptionGroups();

    @GetMapping(value = "/admin/toppings")
    public java.util.List<com.rainbowforest.orderservice.dto.catalog.CatalogToppingDto> getAllToppings();

    @PostMapping(value = "/api/internal/inventory/adjust")
    public void adjustInventory(@org.springframework.web.bind.annotation.RequestBody com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest request);

    @PostMapping(value = "/api/internal/inventory/damaged")
    public void reportDamagedInventory(@org.springframework.web.bind.annotation.RequestBody com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest request);

    @PostMapping(value = "/api/internal/inventory/release")
    public void releaseInventory(@org.springframework.web.bind.annotation.RequestBody com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest request);

    @PostMapping(value = "/api/internal/inventory/reserve")
    public void reserveInventory(@org.springframework.web.bind.annotation.RequestBody java.util.List<com.rainbowforest.orderservice.dto.InventoryAdjustmentRequest> requests);
}
