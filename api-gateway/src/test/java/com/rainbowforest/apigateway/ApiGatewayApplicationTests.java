package com.rainbowforest.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ApiGatewayApplicationTests {

    @Test
    void shouldKeepMiniGameGatewayRoutesConfigured() throws Exception {
        ClassPathResource resource = new ClassPathResource("application.yml");
        String yaml = resource.getContentAsString(StandardCharsets.UTF_8);

        assertThat(yaml).contains("id: mini-game-service");
        assertThat(yaml).contains("/api/games/**");
        assertThat(yaml).contains("/api/admin/mini-games/**");
    }
}
