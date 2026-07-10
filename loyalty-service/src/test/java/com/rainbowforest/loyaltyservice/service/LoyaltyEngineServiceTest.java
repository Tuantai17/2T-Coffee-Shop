package com.rainbowforest.loyaltyservice.service;

import com.rainbowforest.loyaltyservice.domain.LoyaltyAccount;
import com.rainbowforest.loyaltyservice.domain.MembershipTier;
import com.rainbowforest.loyaltyservice.domain.PointTransaction;
import com.rainbowforest.loyaltyservice.repository.LoyaltyAccountRepository;
import com.rainbowforest.loyaltyservice.repository.MembershipTierRepository;
import com.rainbowforest.loyaltyservice.repository.PointTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class LoyaltyEngineServiceTest {

    @Mock
    private LoyaltyAccountRepository accountRepository;

    @Mock
    private PointTransactionRepository transactionRepository;

    @Mock
    private MembershipTierRepository tierRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private LoyaltyEngineService loyaltyEngineService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
    }

    @Test
    void testCalculateEarnedPoints() {
        long points = loyaltyEngineService.calculateEarnedPoints(1500000);
        assertEquals(1500, points);

        long zeroPoints = loyaltyEngineService.calculateEarnedPoints(-10000);
        assertEquals(0, zeroPoints);
    }

    @Test
    void testProcessOrderCompleted() {
        LoyaltyAccount account = new LoyaltyAccount();
        account.setUserId(1L);
        account.setAvailablePoints(100L);
        account.setLifetimeEarnedPoints(100L);
        account.setCurrentTierCode("MEMBER");
        
        MembershipTier currentTier = new MembershipTier();
        currentTier.setCode("MEMBER");
        currentTier.setDisplayOrder(1);

        when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(LoyaltyAccount.class))).thenReturn(account);
        when(tierRepository.findByCode("MEMBER")).thenReturn(Optional.of(currentTier));
        when(tierRepository.findAll()).thenReturn(java.util.List.of(currentTier));

        // eligible spending = 2,500,000 (total) - 500,000 (voucher) = 2,000,000 => 2000 points
        loyaltyEngineService.processOrderCompleted(1L, 1001L, 2500000, 0, 500000, 0, 0);

        assertEquals(2100L, account.getAvailablePoints());
        assertEquals(2100L, account.getLifetimeEarnedPoints());
        
        verify(transactionRepository, times(1)).save(any(PointTransaction.class));
    }
}
