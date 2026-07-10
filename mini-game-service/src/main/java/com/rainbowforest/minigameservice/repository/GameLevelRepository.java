package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.GameLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameLevelRepository extends JpaRepository<GameLevel, Long> {
    List<GameLevel> findByActiveTrue();
    Optional<GameLevel> findByCode(String code);
}
