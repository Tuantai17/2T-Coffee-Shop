package com.rainbowforest.minigameservice;

import com.rainbowforest.minigameservice.domain.GameReward;
import com.rainbowforest.minigameservice.domain.MiniGame;
import com.rainbowforest.minigameservice.repository.GameRewardRepository;
import com.rainbowforest.minigameservice.repository.GameUserLimitRepository;
import com.rainbowforest.minigameservice.repository.MiniGamePlaySessionRepository;
import com.rainbowforest.minigameservice.repository.MiniGameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserMiniGamePlayFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MiniGameRepository miniGameRepository;

    @Autowired
    private GameRewardRepository gameRewardRepository;

    @Autowired
    private MiniGamePlaySessionRepository playSessionRepository;

    @Autowired
    private GameUserLimitRepository gameUserLimitRepository;

    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    private MiniGame game;
    private GameReward reward;

    @BeforeEach
    void setUp() {
        playSessionRepository.deleteAll();
        gameUserLimitRepository.deleteAll();
        gameRewardRepository.deleteAll();
        miniGameRepository.deleteAll();

        game = miniGameRepository.save(MiniGame.builder()
                .name("Memory Match")
                .slug("memory-match")
                .code("MEMORY_MATCH")
                .type("MEMORY_MATCH")
                .dailyPlayLimit(5)
                .status("ACTIVE")
                .visible(true)
                .featured(true)
                .version("v1.0.0")
                .deleted(false)
                .build());

        reward = gameRewardRepository.save(GameReward.builder()
                .game(game)
                .rewardName("10 points")
                .rewardType("POINT")
                .pointValue(10L)
                .probability(new BigDecimal("100.00"))
                .totalQuantity(100)
                .remainingQuantity(100)
                .status("ACTIVE")
                .build());

        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
    }

    @Test
    void shouldPlayMemoryMatchAndGrantReward() throws Exception {
        mockMvc.perform(post("/api/games/{id}/play", game.getId())
                        .contentType(APPLICATION_JSON)
                        .header("X-User-Id", "99")
                        .header("User-Agent", "JUnit")
                        .header("X-Real-IP", "127.0.0.1")
                        .content("""
                                {
                                  "score": 120,
                                  "playData": {
                                    "completed": true,
                                    "matchedPairs": 6,
                                    "totalPairs": 6,
                                    "attempts": 9,
                                    "durationSeconds": 45,
                                    "clientSeed": "seed-123456",
                                    "boardVersion": "v1"
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(game.getId()))
                .andExpect(jsonPath("$.result").value("REWARDED"))
                .andExpect(jsonPath("$.pointEarned").value(10))
                .andExpect(jsonPath("$.remainingPlays").value(4));

        verify(kafkaTemplate).send(anyString(), anyString(), any());
        org.assertj.core.api.Assertions.assertThat(playSessionRepository.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(gameRewardRepository.findById(reward.getId()).orElseThrow().getRemainingQuantity()).isEqualTo(99);
    }
}
