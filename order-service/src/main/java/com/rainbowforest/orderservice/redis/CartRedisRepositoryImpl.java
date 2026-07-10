package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository {

    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;

    public CartRedisRepositoryImpl(ObjectMapper objectMapper, StringRedisTemplate redisTemplate) {
        this.objectMapper = objectMapper.copy().findAndRegisterModules();
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            com.rainbowforest.orderservice.dto.CartItemDto cartItem = (com.rainbowforest.orderservice.dto.CartItemDto) item;
            String jsonObject = objectMapper.writeValueAsString(cartItem);
            redisTemplate.opsForHash().put(key, cartItem.getCartItemId(), jsonObject);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot write cart item to Redis", e);
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        try {
            java.util.Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
            for (Object value : entries.values()) {
                cart.add(objectMapper.readValue(value.toString(), type));
            }
        } catch (Exception e) {
            throw new IllegalStateException("Cannot read cart from Redis", e);
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object itemId) {
        try {
            redisTemplate.opsForHash().delete(key, itemId.toString());
        } catch (Exception e) {
            throw new IllegalStateException("Cannot delete cart item from Redis", e);
        }
    }

    @Override
    public void deleteCart(String key) {
        redisTemplate.delete(key);
    }
}
