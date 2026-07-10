package com.rainbowforest.revenueservice.repository;

import com.rainbowforest.revenueservice.domain.DailyRevenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyRevenueRepository extends JpaRepository<DailyRevenue, LocalDate> {
    List<DailyRevenue> findTop30ByOrderByDateDesc();
}
