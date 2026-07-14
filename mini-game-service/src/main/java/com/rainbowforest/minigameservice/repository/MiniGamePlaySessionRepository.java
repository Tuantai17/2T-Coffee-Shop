package com.rainbowforest.minigameservice.repository;

import com.rainbowforest.minigameservice.domain.MiniGamePlaySession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MiniGamePlaySessionRepository extends JpaRepository<MiniGamePlaySession, Long> {

    List<MiniGamePlaySession> findByUserIdOrderByPlayedAtDesc(Long userId);

    List<MiniGamePlaySession> findByGame_IdOrderByPlayedAtDesc(Long gameId);

    long countByGame_Id(Long gameId);

    @Query("select count(distinct s.userId) from MiniGamePlaySession s where s.game.id = :gameId")
    long countDistinctUsersByGameId(Long gameId);

    @Query("select count(distinct s.userId) from MiniGamePlaySession s")
    long countDistinctUsers();

    @Query("select coalesce(sum(s.pointEarned), 0) from MiniGamePlaySession s")
    long sumAllPointEarned();

    @Query("select coalesce(sum(s.pointEarned), 0) from MiniGamePlaySession s where s.game.id = :gameId")
    long sumPointEarnedByGameId(Long gameId);

    long countByVoucherIdIsNotNull();

    long countByGame_IdAndVoucherIdIsNotNull(Long gameId);

    long countByUserIdAndGame_IdAndPlayedAtAfter(Long userId, Long gameId, LocalDateTime playedAt);

    @Query("select s from MiniGamePlaySession s where s.playedAt >= :from order by s.playedAt asc")
    List<MiniGamePlaySession> findAllFrom(LocalDateTime from);

    @Query("select s.userId as userId, coalesce(sum(s.pointEarned), 0) as totalPoints, count(s.id) as playCount, min(s.timeTakenSeconds) as bestTime from MiniGamePlaySession s where s.game.id = :gameId group by s.userId order by totalPoints desc")
    List<Object[]> findTopPlayersByGameId(@Param("gameId") Long gameId, Pageable pageable);

    @Query("select s.userId as userId, coalesce(sum(s.pointEarned), 0) as totalPoints, count(s.id) as playCount, min(s.timeTakenSeconds) as bestTime from MiniGamePlaySession s where s.game.id = :gameId and s.playedAt >= :startDate group by s.userId order by totalPoints desc")
    List<Object[]> findTopPlayersByGameIdAndPeriod(@Param("gameId") Long gameId, @Param("startDate") LocalDateTime startDate, Pageable pageable);

    @Query("select s from MiniGamePlaySession s where s.game.id = :gameId and s.result = 'REWARDED' order by s.playedAt desc")
    List<MiniGamePlaySession> findRecentWinnersByGameId(@Param("gameId") Long gameId, Pageable pageable);
}
