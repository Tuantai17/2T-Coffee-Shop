package com.rainbowforest.revenueservice.repository;

import com.rainbowforest.revenueservice.domain.ToppingStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToppingStatRepository extends JpaRepository<ToppingStat, Long> {
    List<ToppingStat> findTop10ByOrderByTotalQuantityDesc();
}
