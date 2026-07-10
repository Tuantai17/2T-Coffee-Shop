package com.rainbowforest.revenueservice.repository;

import com.rainbowforest.revenueservice.domain.InteractionStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InteractionStatRepository extends JpaRepository<InteractionStat, LocalDate> {
    List<InteractionStat> findTop30ByOrderByDateDesc();
}
