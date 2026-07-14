package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.GameReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface GameRewardRepository extends JpaRepository<GameReward, Long> {

    List<GameReward> findByGame_IdOrderByCreatedAtDesc(Long gameId);

    List<GameReward> findByGame_IdAndStatusIgnoreCaseOrderByCreatedAtDesc(Long gameId, String status);

    @Query("select coalesce(sum(r.probability), 0) from GameReward r where r.game.id = :gameId and upper(r.status) = 'ACTIVE'")
    BigDecimal sumActiveProbabilityByGameId(Long gameId);

    long countByGame_Id(Long gameId);
}
