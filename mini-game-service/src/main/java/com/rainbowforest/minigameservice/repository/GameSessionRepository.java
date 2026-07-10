package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, String> {
    List<GameSession> findByUserIdOrderByStartedAtDesc(Long userId);
    long countByUserIdAndStartedAtAfter(Long userId, LocalDateTime date);
}
