package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.MysteryBoxItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MysteryBoxItemRepository extends JpaRepository<MysteryBoxItem, Long> {
    List<MysteryBoxItem> findByBoxIdAndStatus(Long boxId, String status);
}
