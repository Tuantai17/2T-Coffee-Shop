package com.rainbowforest.minigameservice.service.reward;

import com.rainbowforest.minigameservice.domain.GameReward;
import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.repository.GameRewardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProbabilityRewardEngineTest {

    @Mock
    private GameRewardRepository gameRewardRepository;

    @Mock
    private RewardProbabilityCalculator rewardProbabilityCalculator;

    @Mock
    private RandomRollProvider randomRollProvider;

    @InjectMocks
    private ProbabilityRewardEngine probabilityRewardEngine;

    private GameReward pointReward;
    private GameReward voucherReward;

    @BeforeEach
    void setUp() {
        MiniGame game = MiniGame.builder().id(1L).name("Memory Match").build();
        pointReward = GameReward.builder()
                .id(10L)
                .game(game)
                .rewardName("10 points")
                .rewardType("POINT")
                .probability(new BigDecimal("30.00"))
                .remainingQuantity(100)
                .build();
        voucherReward = GameReward.builder()
                .id(11L)
                .game(game)
                .rewardName("Voucher")
                .rewardType("VOUCHER")
                .probability(new BigDecimal("20.00"))
                .remainingQuantity(50)
                .build();
    }

    @Test
    void shouldReturnRewardWhenRollFallsInsideProbabilityWindow() {
        when(gameRewardRepository.findByGame_IdAndStatusIgnoreCaseOrderByCreatedAtDesc(1L, "ACTIVE"))
                .thenReturn(List.of(pointReward, voucherReward));
        when(rewardProbabilityCalculator.sumProbability(List.of(pointReward, voucherReward)))
                .thenReturn(new BigDecimal("50.00"));
        when(randomRollProvider.nextDouble(0.0, 100.0)).thenReturn(12.5);

        GameReward reward = probabilityRewardEngine.selectReward(1L);

        assertThat(reward).isNotNull();
        assertThat(reward.getId()).isEqualTo(10L);
    }

    @Test
    void shouldReturnNullWhenRollExceedsTotalProbability() {
        when(gameRewardRepository.findByGame_IdAndStatusIgnoreCaseOrderByCreatedAtDesc(1L, "ACTIVE"))
                .thenReturn(List.of(pointReward, voucherReward));
        when(rewardProbabilityCalculator.sumProbability(List.of(pointReward, voucherReward)))
                .thenReturn(new BigDecimal("50.00"));
        when(randomRollProvider.nextDouble(0.0, 100.0)).thenReturn(81.0);

        GameReward reward = probabilityRewardEngine.selectReward(1L);

        assertThat(reward).isNull();
    }
}
