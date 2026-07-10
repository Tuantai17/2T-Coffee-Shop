package com.rainbowforest.revenueservice.repository;

import com.rainbowforest.revenueservice.domain.ProductStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductStatRepository extends JpaRepository<ProductStat, Long> {
    List<ProductStat> findTop10ByOrderByTotalQuantityDesc();
}
