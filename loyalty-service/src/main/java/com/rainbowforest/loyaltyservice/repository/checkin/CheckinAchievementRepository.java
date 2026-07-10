package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinAchievementRepository extends JpaRepository<CheckinAchievement, Long> {
    List<CheckinAchievement> findByStatus(String status);
}
