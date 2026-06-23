package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserIdOrderByIdDesc(Long userId);
    WishlistItem findByUserIdAndProductId(Long userId, Long productId);
}
