package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.GameUserLimit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface GameUserLimitRepository extends JpaRepository<GameUserLimit, Long> {

    Optional<GameUserLimit> findByUserIdAndGame_IdAndPlayDate(Long userId, Long gameId, LocalDate playDate);
}
