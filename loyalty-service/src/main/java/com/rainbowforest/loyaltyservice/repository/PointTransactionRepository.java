package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PointTransaction> findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(String referenceType, String referenceId);

    @Query("SELECT p FROM PointTransaction p WHERE p.userId = :userId AND p.createdAt >= :startDate AND p.source = 'ORDER' AND p.status = 'COMPLETED'")
    List<PointTransaction> findOrderTransactionsSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
}
