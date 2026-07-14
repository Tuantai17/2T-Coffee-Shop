package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.MiniGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface MiniGameRepository extends JpaRepository<MiniGame, Long>, JpaSpecificationExecutor<MiniGame> {

    Optional<MiniGame> findByIdAndDeletedFalse(Long id);

    Optional<MiniGame> findBySlugIgnoreCaseAndDeletedFalse(String slug);

    Optional<MiniGame> findByCodeIgnoreCase(String code);

    Optional<MiniGame> findBySlugIgnoreCase(String slug);

    List<MiniGame> findByDeletedFalseOrderByFeaturedDescUpdatedAtDesc();

    List<MiniGame> findByDeletedFalseAndStatusIgnoreCaseAndVisibleTrueOrderByFeaturedDescUpdatedAtDesc(String status);
}
