package com.rainbowforest.inventoryservice.repository;

import com.rainbowforest.inventoryservice.domain.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {
    Optional<InventoryReservation> findByReservationCode(String reservationCode);
    List<InventoryReservation> findByOrderId(Long orderId);
    @org.springframework.data.jpa.repository.Query("SELECT r FROM InventoryReservation r WHERE r.orderId = :orderId AND r.productId = :productId AND ((:variantId IS NULL AND r.variantId IS NULL) OR r.variantId = :variantId)")
    Optional<InventoryReservation> findByOrderIdAndProductIdAndVariantId(@org.springframework.data.repository.query.Param("orderId") Long orderId, @org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("variantId") Long variantId);
}
