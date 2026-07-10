package com.rainbowforest.productcatalogservice.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module hibernateModule = new com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module();
        hibernateModule.configure(com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module.Feature.REPLACE_PERSISTENT_COLLECTIONS, true);
        objectMapper.registerModule(hibernateModule);
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(), ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .entryTtl(Duration.ofMinutes(10));

        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
        configMap.put("productDetail", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        configMap.put("categoryTree", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        configMap.put("banners", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        configMap.put("menus", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        configMap.put("homepage", defaultConfig.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configMap)
                .build();
    }
}
