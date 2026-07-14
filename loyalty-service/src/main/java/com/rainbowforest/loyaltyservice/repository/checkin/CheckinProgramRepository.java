package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CheckinProgramRepository extends JpaRepository<CheckinProgram, Long> {
    Optional<CheckinProgram> findByCode(String code);
    List<CheckinProgram> findByStatus(String status);
}
