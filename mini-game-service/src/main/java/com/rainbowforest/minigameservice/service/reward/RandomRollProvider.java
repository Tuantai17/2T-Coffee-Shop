package com.rainbowforest.minigameservice.service.reward;

public interface RandomRollProvider {

    double nextDouble(double minInclusive, double maxExclusive);
}
