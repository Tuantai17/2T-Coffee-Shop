package com.rainbowforest.inventoryservice.repository;

import com.rainbowforest.inventoryservice.domain.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    Optional<InventoryTransaction> findByTransactionCode(String transactionCode);
    List<InventoryTransaction> findByProductId(Long productId);
    List<InventoryTransaction> findByOrderId(Long orderId);
}
