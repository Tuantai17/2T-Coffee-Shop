package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.GameActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameActivityLogRepository extends JpaRepository<GameActivityLog, Long> {

    List<GameActivityLog> findByGame_IdOrderByCreatedAtDesc(Long gameId);
}
