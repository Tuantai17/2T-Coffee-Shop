package com.rainbowforest.inventoryservice.service;

import com.rainbowforest.inventoryservice.common.exception.BusinessException;
import com.rainbowforest.inventoryservice.common.exception.ResourceNotFoundException;
import com.rainbowforest.inventoryservice.domain.Inventory;
import com.rainbowforest.inventoryservice.domain.InventoryReservation;
import com.rainbowforest.inventoryservice.domain.InventoryTransaction;
import com.rainbowforest.inventoryservice.dto.InventoryAdjustmentRequest;
import com.rainbowforest.inventoryservice.dto.InventoryResponse;
import com.rainbowforest.inventoryservice.repository.InventoryRepository;
import com.rainbowforest.inventoryservice.repository.InventoryReservationRepository;
import com.rainbowforest.inventoryservice.repository.InventoryTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryReservationRepository reservationRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Override
    public InventoryResponse getProductInventory(Long productId, Long variantId) {
        Inventory inv = findInventoryOrFallback(productId, variantId).orElse(null);
        if (inv == null) return new InventoryResponse(productId, variantId, 0, 0);
        return new InventoryResponse(productId, variantId, inv.getAvailableQuantity(), inv.getReservedQuantity());
    }

    @Override
    @Transactional
    public void reserveInventory(List<InventoryAdjustmentRequest> requests) {
        if (requests == null || requests.isEmpty()) return;

        for (InventoryAdjustmentRequest req : requests) {
            // Idempotency check for reservation per order, product, and variant
            if (reservationRepository.findByOrderIdAndProductIdAndVariantId(req.getOrderId(), req.getProductId(), req.getVariantId()).isPresent()) {
                continue;
            }

            Inventory inv = findInventoryOrFallback(req.getProductId(), req.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "INVENTORY_NOT_FOUND",
                        buildMissingInventoryMessage(req.getProductId(), req.getVariantId())
                ));

            if (inv.getAvailableQuantity() < req.getQuantity()) {
                throw new BusinessException(
                        "INSUFFICIENT_INVENTORY",
                        buildInsufficientInventoryMessage(req.getProductId(), req.getVariantId(), inv.getAvailableQuantity(), req.getQuantity())
                );
            }

            int beforeOn = inv.getOnHandQuantity();
            int beforeRes = inv.getReservedQuantity();

            inv.setReservedQuantity(inv.getReservedQuantity() + req.getQuantity());
            inv.setUpdatedAt(LocalDateTime.now());
            inventoryRepository.save(inv);

            InventoryReservation res = new InventoryReservation();
            res.setReservationCode(UUID.randomUUID().toString());
            res.setOrderId(req.getOrderId());
            res.setProductId(req.getProductId());
            res.setVariantId(req.getVariantId());
            res.setQuantity(req.getQuantity());
            res.setStatus("RESERVED");
            res.setExpiresAt(LocalDateTime.now().plusMinutes(15));
            reservationRepository.save(res);
            
            InventoryTransaction txn = new InventoryTransaction();
            txn.setTransactionCode(UUID.randomUUID().toString());
            txn.setOrderId(req.getOrderId());
            txn.setProductId(req.getProductId());
            txn.setVariantId(req.getVariantId());
            txn.setType("RESERVE");
            txn.setQuantity(req.getQuantity());
            txn.setBeforeOnHand(beforeOn);
            txn.setAfterOnHand(inv.getOnHandQuantity());
            txn.setBeforeReserved(beforeRes);
            txn.setAfterReserved(inv.getReservedQuantity());
            txn.setReason(req.getReason() != null ? req.getReason() : "Checkout reserve");
            transactionRepository.save(txn);
        }
    }

    private String buildMissingInventoryMessage(Long productId, Long variantId) {
        if (variantId != null) {
            return "Khong tim thay ton kho cho san pham " + productId + " voi bien the " + variantId;
        }
        return "Khong tim thay ton kho cho san pham " + productId;
    }

    private java.util.Optional<Inventory> findInventoryOrFallback(Long productId, Long variantId) {
        java.util.Optional<Inventory> exactInventory =
                inventoryRepository.findByProductIdAndVariantId(productId, variantId);

        if (exactInventory.isPresent() || variantId == null) {
            return exactInventory;
        }

        // Current admin product flow manages one shared stock value per product.
        // If a variant does not have its own inventory row yet, use the product-level stock.
        return inventoryRepository.findByProductIdAndVariantId(productId, null);
    }

    private String buildInsufficientInventoryMessage(Long productId, Long variantId, int availableQuantity, int requestedQuantity) {
        StringBuilder message = new StringBuilder("San pham ");
        message.append(productId);
        if (variantId != null) {
            message.append(" (bien the ").append(variantId).append(")");
        }
        message.append(" khong du ton kho. Con lai ")
                .append(availableQuantity)
                .append(", yeu cau ")
                .append(requestedQuantity);
        return message.toString();
    }

    @Override
    @Transactional
    public void commitReservation(Long orderId) {
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);
        for (InventoryReservation res : reservations) {
            if ("COMMITTED".equals(res.getStatus())) continue;
            
            if ("RESERVED".equals(res.getStatus())) {
                Inventory inv = findInventoryOrFallback(res.getProductId(), res.getVariantId()).orElseThrow();
                int beforeOn = inv.getOnHandQuantity();
                int beforeRes = inv.getReservedQuantity();
                
                inv.setOnHandQuantity(inv.getOnHandQuantity() - res.getQuantity());
                inv.setReservedQuantity(inv.getReservedQuantity() - res.getQuantity());
                inventoryRepository.save(inv);
                
                res.setStatus("COMMITTED");
                reservationRepository.save(res);
                
                InventoryTransaction txn = new InventoryTransaction();
                txn.setTransactionCode(UUID.randomUUID().toString());
                txn.setOrderId(orderId);
                txn.setProductId(res.getProductId());
                txn.setVariantId(res.getVariantId());
                txn.setType("COMMIT");
                txn.setQuantity(res.getQuantity());
                txn.setBeforeOnHand(beforeOn);
                txn.setAfterOnHand(inv.getOnHandQuantity());
                txn.setBeforeReserved(beforeRes);
                txn.setAfterReserved(inv.getReservedQuantity());
                txn.setReason("Order Confirmed");
                transactionRepository.save(txn);
            }
        }
    }

    @Override
    @Transactional
    public void releaseReservation(Long orderId) {
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);
        for (InventoryReservation res : reservations) {
            if ("RELEASED".equals(res.getStatus()) || "COMMITTED".equals(res.getStatus())) continue;
            
            if ("RESERVED".equals(res.getStatus())) {
                Inventory inv = findInventoryOrFallback(res.getProductId(), res.getVariantId()).orElseThrow();
                int beforeOn = inv.getOnHandQuantity();
                int beforeRes = inv.getReservedQuantity();
                
                inv.setReservedQuantity(inv.getReservedQuantity() - res.getQuantity());
                inventoryRepository.save(inv);
                
                res.setStatus("RELEASED");
                reservationRepository.save(res);
                
                InventoryTransaction txn = new InventoryTransaction();
                txn.setTransactionCode(UUID.randomUUID().toString());
                txn.setOrderId(orderId);
                txn.setProductId(res.getProductId());
                txn.setVariantId(res.getVariantId());
                txn.setType("RELEASE");
                txn.setQuantity(res.getQuantity());
                txn.setBeforeOnHand(beforeOn);
                txn.setAfterOnHand(inv.getOnHandQuantity());
                txn.setBeforeReserved(beforeRes);
                txn.setAfterReserved(inv.getReservedQuantity());
                txn.setReason("Order Cancelled / Failed");
                transactionRepository.save(txn);
            }
        }
    }

    @Override
    @Transactional
    public void restockInventory(Long orderId) {
        // Use for cancelled order after committed
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);
        for (InventoryReservation res : reservations) {
            if ("COMMITTED".equals(res.getStatus())) {
                Inventory inv = findInventoryOrFallback(res.getProductId(), res.getVariantId()).orElseThrow();
                int beforeOn = inv.getOnHandQuantity();
                
                inv.setOnHandQuantity(inv.getOnHandQuantity() + res.getQuantity());
                inventoryRepository.save(inv);
                
                res.setStatus("RELEASED"); // or EXPIRED
                reservationRepository.save(res);
                
                InventoryTransaction txn = new InventoryTransaction();
                txn.setTransactionCode(UUID.randomUUID().toString());
                txn.setOrderId(orderId);
                txn.setProductId(res.getProductId());
                txn.setVariantId(res.getVariantId());
                txn.setType("RESTOCK");
                txn.setQuantity(res.getQuantity());
                txn.setBeforeOnHand(beforeOn);
                txn.setAfterOnHand(inv.getOnHandQuantity());
                txn.setBeforeReserved(inv.getReservedQuantity());
                txn.setAfterReserved(inv.getReservedQuantity());
                txn.setReason("Order Cancelled and Restocked");
                transactionRepository.save(txn);
            }
        }
    }

    @Override
    @Transactional
    public void importInventory(InventoryAdjustmentRequest req) {
        Inventory inv = inventoryRepository.findByProductIdAndVariantId(req.getProductId(), req.getVariantId()).orElse(new Inventory());
        if (inv.getProductId() == null) {
            inv.setProductId(req.getProductId());
            inv.setVariantId(req.getVariantId());
            inv.setOnHandQuantity(0);
            inv.setReservedQuantity(0);
        }
        
        int beforeOn = inv.getOnHandQuantity();
        inv.setOnHandQuantity(inv.getOnHandQuantity() + req.getQuantity());
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
        
        InventoryTransaction txn = new InventoryTransaction();
        txn.setTransactionCode(UUID.randomUUID().toString());
        txn.setProductId(req.getProductId());
        txn.setVariantId(req.getVariantId());
        txn.setType("IMPORT");
        txn.setQuantity(req.getQuantity());
        txn.setBeforeOnHand(beforeOn);
        txn.setAfterOnHand(inv.getOnHandQuantity());
        txn.setBeforeReserved(inv.getReservedQuantity());
        txn.setAfterReserved(inv.getReservedQuantity());
        txn.setReason(req.getReason());
        transactionRepository.save(txn);
    }
    
    @Override
    @Transactional
    public void adjustInventory(InventoryAdjustmentRequest req) {
        // Admin direct adjustment
        Inventory inv = findInventoryOrFallback(req.getProductId(), req.getVariantId()).orElseThrow();
        int beforeOn = inv.getOnHandQuantity();
        inv.setOnHandQuantity(inv.getOnHandQuantity() + req.getQuantity());
        if (inv.getAvailableQuantity() < 0) {
            throw new RuntimeException("Adjustment leads to negative available quantity");
        }
        inventoryRepository.save(inv);
        
        InventoryTransaction txn = new InventoryTransaction();
        txn.setTransactionCode(UUID.randomUUID().toString());
        txn.setProductId(req.getProductId());
        txn.setVariantId(req.getVariantId());
        txn.setType("ADJUSTMENT");
        txn.setQuantity(req.getQuantity());
        txn.setBeforeOnHand(beforeOn);
        txn.setAfterOnHand(inv.getOnHandQuantity());
        txn.setBeforeReserved(inv.getReservedQuantity());
        txn.setAfterReserved(inv.getReservedQuantity());
        txn.setReason(req.getReason());
        transactionRepository.save(txn);
    }
}
