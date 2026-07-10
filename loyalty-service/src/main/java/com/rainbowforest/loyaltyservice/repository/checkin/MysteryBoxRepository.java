package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.MysteryBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MysteryBoxRepository extends JpaRepository<MysteryBox, Long> {
    List<MysteryBox> findByStatus(String status);
}
