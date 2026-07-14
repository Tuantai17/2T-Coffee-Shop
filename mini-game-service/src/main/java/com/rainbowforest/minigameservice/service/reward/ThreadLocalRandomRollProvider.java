package com.rainbowforest.minigameservice.service.reward;

import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
public class ThreadLocalRandomRollProvider implements RandomRollProvider {

    @Override
    public double nextDouble(double minInclusive, double maxExclusive) {
        return ThreadLocalRandom.current().nextDouble(minInclusive, maxExclusive);
    }
}
