package com.rainbowforest.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@RedisHash("RefreshToken")
public class RefreshToken {
    @Id
    private String id;
    
    @Indexed
    private String token;
    
    private String username;
    
    @TimeToLive
    private Long expiration;
}
