package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.UserCheckinProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCheckinProgressRepository extends JpaRepository<UserCheckinProgress, Long> {
    Optional<UserCheckinProgress> findByProgramIdAndUserId(Long programId, Long userId);
}
