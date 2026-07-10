package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.UserCheckinAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCheckinAchievementRepository extends JpaRepository<UserCheckinAchievement, Long> {
    List<UserCheckinAchievement> findByUserId(Long userId);
    Optional<UserCheckinAchievement> findByUserIdAndAchievementId(Long userId, Long achievementId);
}
