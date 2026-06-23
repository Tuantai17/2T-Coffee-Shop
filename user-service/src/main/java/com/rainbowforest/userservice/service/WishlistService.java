package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.WishlistItem;

import java.util.List;

public interface WishlistService {
    List<WishlistItem> getWishlistByUserId(Long userId);
    WishlistItem addWishlistItem(Long userId, WishlistItem wishlistItem);
    void deleteWishlistItem(Long userId, Long wishlistItemId);
}
