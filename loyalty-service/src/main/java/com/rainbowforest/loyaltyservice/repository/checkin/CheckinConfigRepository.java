package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CheckinConfigRepository extends JpaRepository<CheckinConfig, Long> {
    Optional<CheckinConfig> findByIsActiveTrue();
}
