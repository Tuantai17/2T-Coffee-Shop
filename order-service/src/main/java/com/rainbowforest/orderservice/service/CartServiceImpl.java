package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.dto.CartItemDto;
import com.rainbowforest.orderservice.dto.CartItemRequest;
import com.rainbowforest.orderservice.dto.catalog.*;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.redis.CartRedisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private ProductClient productClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    @Override
    public void addItemToCart(String cartId, CartItemRequest request) {
        CatalogProductDto product = productClient.getProductById(request.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("Product not found");
        }
        
        CartItemDto cartItem = buildCartItem(product, request);
        
        // Check if exists
        List<CartItemDto> cart = getAllItemsFromCart(cartId);
        boolean exists = false;
        for (CartItemDto item : cart) {
            if (item.getCartItemId().equals(cartItem.getCartItemId())) {
                item.setQuantity(item.getQuantity() + request.getQuantity());
                
                BigDecimal currentToppingTotal = item.getToppingTotal() != null ? item.getToppingTotal() : BigDecimal.ZERO;
                BigDecimal additionalToppingTotal = cartItem.getToppingTotal() != null ? cartItem.getToppingTotal() : BigDecimal.ZERO;
                item.setToppingTotal(currentToppingTotal.add(additionalToppingTotal));
                
                if (item.getToppingIds() != null && cartItem.getToppingIds() != null) {
                    List<Long> newToppingIds = new ArrayList<>(item.getToppingIds());
                    newToppingIds.addAll(cartItem.getToppingIds());
                    item.setToppingIds(newToppingIds);
                }
                
                item.setSubTotal(item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())).add(item.getToppingTotal()));
                cartRedisRepository.addItemToCart(cartId, item);
                exists = true;
                break;
            }
        }
        if (!exists) {
            cartRedisRepository.addItemToCart(cartId, cartItem);
        }
    }

    @Override
    public List<Object> getCart(String cartId) {
        return new ArrayList<>(cartRedisRepository.getCart(cartId, CartItemDto.class));
    }

    @Override
    public void changeItemQuantity(String cartId, String cartItemId, Integer quantity) {
        List<CartItemDto> cart = getAllItemsFromCart(cartId);
        for(CartItemDto item : cart){
            if(item.getCartItemId().equals(cartItemId)){
                item.setQuantity(quantity);
                BigDecimal toppingTotal = item.getToppingTotal() != null ? item.getToppingTotal() : BigDecimal.ZERO;
                item.setSubTotal(item.getUnitPrice().multiply(new BigDecimal(quantity)).add(toppingTotal));
                cartRedisRepository.addItemToCart(cartId, item);
                break;
            }
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, String cartItemId) {
        cartRedisRepository.deleteItemFromCart(cartId, cartItemId);
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, String cartItemId) {
        List<CartItemDto> cart = getAllItemsFromCart(cartId);
        for(CartItemDto item : cart){
            if(item.getCartItemId().equals(cartItemId)){
                return true;
            }
        }
        return false;
    }

    @Override
    public List<CartItemDto> getAllItemsFromCart(String cartId) {
        List<CartItemDto> items = new ArrayList<>();
        for (Object cartItem : cartRedisRepository.getCart(cartId, CartItemDto.class)) {
            items.add((CartItemDto) cartItem);
        }
        return items;
    }

    @Override
    public void deleteCart(String cartId) {
        cartRedisRepository.deleteCart(cartId);
    }
    
    private CartItemDto buildCartItem(CatalogProductDto product, CartItemRequest request) {
        CartItemDto dto = new CartItemDto();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setProductImageUrl(product.getImageUrl());
        dto.setQuantity(request.getQuantity());
        dto.setNote(request.getNote());
        
        BigDecimal unitPrice = product.getPrice();
        
        StringBuilder hashBuilder = new StringBuilder();
        hashBuilder.append(product.getId()).append("_");
        
        if (request.getVariantId() != null && product.getVariants() != null) {
            CatalogVariantDto variant = product.getVariants().stream()
                .filter(v -> v.getId().equals(request.getVariantId()))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Variant not found"));
            
            dto.setVariantId(variant.getId());
            dto.setVariantName(variant.getSizeName());
            dto.setVariantPrice(variant.getPriceAdjustment());
            if (variant.getPriceAdjustment() != null) {
                unitPrice = unitPrice.add(variant.getPriceAdjustment());
            }
            hashBuilder.append(variant.getId());
        }
        hashBuilder.append("_");
        
        if (request.getOptionIds() != null && !request.getOptionIds().isEmpty()) {
            List<String> optionNames = new ArrayList<>();
            List<Long> sortedOptionIds = new ArrayList<>(request.getOptionIds());
            Collections.sort(sortedOptionIds);
            dto.setOptionIds(sortedOptionIds);
            
            List<CatalogOptionGroupDto> allGroups = productClient.getAllOptionGroups();
            
            for (Long optId : sortedOptionIds) {
                if (allGroups != null) {
                    for (CatalogOptionGroupDto group : allGroups) {
                        if (group.getOptions() != null) {
                            for (CatalogOptionDto opt : group.getOptions()) {
                                if (opt.getId().equals(optId)) {
                                    optionNames.add(opt.getName());
                                    if (opt.getPriceAdjustment() != null) {
                                        unitPrice = unitPrice.add(opt.getPriceAdjustment());
                                    }
                                    hashBuilder.append(opt.getId()).append("-");
                                }
                            }
                        }
                    }
                }
            }
            dto.setOptionsSnapshot(String.join(", ", optionNames));
        }
        hashBuilder.append("_");
        
        BigDecimal toppingTotal = BigDecimal.ZERO;
        
        if (request.getToppingIds() != null && !request.getToppingIds().isEmpty()) {
            List<String> toppingNames = new ArrayList<>();
            List<Long> sortedToppingIds = new ArrayList<>(request.getToppingIds());
            Collections.sort(sortedToppingIds);
            dto.setToppingIds(sortedToppingIds);
            
            List<CatalogToppingDto> allToppings = productClient.getAllToppings();
            
            for (Long topId : sortedToppingIds) {
                if (allToppings != null) {
                    for (CatalogToppingDto top : allToppings) {
                        if (top.getId().equals(topId)) {
                            toppingNames.add(top.getName());
                            if (top.getPrice() != null) {
                                toppingTotal = toppingTotal.add(top.getPrice());
                            }
                            hashBuilder.append(top.getId()).append("-");
                        }
                    }
                }
            }
            dto.setToppingsSnapshot(String.join(", ", toppingNames));
        }
        
        dto.setCartItemId(hashBuilder.toString());
        dto.setUnitPrice(unitPrice);
        dto.setToppingTotal(toppingTotal);
        dto.setSubTotal(unitPrice.multiply(new BigDecimal(request.getQuantity())).add(toppingTotal));
        return dto;
    }
}
