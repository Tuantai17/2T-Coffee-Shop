package com.rainbowforest.orderservice.service;

import java.util.List;

import com.rainbowforest.orderservice.domain.Item;

public interface CartService {

    public void addItemToCart(String cartId, com.rainbowforest.orderservice.dto.CartItemRequest request);
    public List<Object> getCart(String cartId);
    public void changeItemQuantity(String cartId, String cartItemId, Integer quantity);
    public void deleteItemFromCart(String cartId, String cartItemId);
    public boolean checkIfItemIsExist(String cartId, String cartItemId);
    public List<com.rainbowforest.orderservice.dto.CartItemDto> getAllItemsFromCart(String cartId);
    public void deleteCart(String cartId);
}
