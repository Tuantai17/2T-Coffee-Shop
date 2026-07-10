package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.VoucherDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherDefinitionRepository extends JpaRepository<VoucherDefinition, Long> {
    List<VoucherDefinition> findByActiveTrue();
    List<VoucherDefinition> findByActiveTrueOrderByUpdatedAtDesc();
    Optional<VoucherDefinition> findByCode(String code);
}
