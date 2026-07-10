package com.rainbowforest.loyaltyservice.repository;

import com.rainbowforest.loyaltyservice.domain.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {
    List<UserVoucher> findByUserId(Long userId);
    List<UserVoucher> findByUserIdAndStatus(Long userId, String status);
    List<UserVoucher> findByUserIdOrderByAcquiredAtDesc(Long userId);
    Optional<UserVoucher> findByUserIdAndCodeIgnoreCase(Long userId, String code);
    List<UserVoucher> findByVoucherDefinition_Id(Long voucherDefinitionId);
}
