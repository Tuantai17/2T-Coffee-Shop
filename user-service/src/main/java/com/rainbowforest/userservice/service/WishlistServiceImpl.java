package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.WishlistItem;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<WishlistItem> getWishlistByUserId(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByIdDesc(userId);
    }

    @Override
    public WishlistItem addWishlistItem(Long userId, WishlistItem wishlistItem) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || wishlistItem.getProductId() == null) {
            return null;
        }
        WishlistItem existing = wishlistItemRepository.findByUserIdAndProductId(userId, wishlistItem.getProductId());
        if (existing != null) {
            return existing;
        }
        wishlistItem.setUser(user);
        return wishlistItemRepository.save(wishlistItem);
    }

    @Override
    public void deleteWishlistItem(Long userId, Long wishlistItemId) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId).orElse(null);
        if (item != null && item.getUser() != null && item.getUser().getId().equals(userId)) {
            wishlistItemRepository.delete(item);
        }
    }
}
