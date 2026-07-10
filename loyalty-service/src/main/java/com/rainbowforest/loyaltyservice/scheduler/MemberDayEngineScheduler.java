package com.rainbowforest.loyaltyservice.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class MemberDayEngineScheduler {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // Chạy lúc 00:05 mỗi ngày mùng 5 hàng tháng
    @Scheduled(cron = "0 5 0 5 * *")
    public void activateMemberDay() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String lockKey = "loyalty:lock:memberday:" + today;

        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofHours(24));
        if (Boolean.FALSE.equals(acquired)) {
            return;
        }

        try {
            // Logic kích hoạt ngày hội thành viên: 
            // Có thể publish sự kiện MEMBER_DAY_ACTIVATED ra Kafka 
            // để Product/Pricing Service biết và giảm giá, 
            // hoặc gửi Push Notification đến toàn bộ người dùng.
            
            System.out.println("Member Day Activated for: " + today);

        } catch (Exception e) {
            redisTemplate.delete(lockKey);
            throw e;
        }
    }
}
