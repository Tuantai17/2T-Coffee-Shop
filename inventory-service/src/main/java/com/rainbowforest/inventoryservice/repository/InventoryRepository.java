package com.rainbowforest.inventoryservice.repository;

import com.rainbowforest.inventoryservice.domain.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT i FROM Inventory i WHERE i.productId = :productId AND ((:variantId IS NULL AND i.variantId IS NULL) OR i.variantId = :variantId)")
    Optional<Inventory> findByProductIdAndVariantId(@org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("variantId") Long variantId);
}
