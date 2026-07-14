package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinProgramReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CheckinProgramRewardRepository extends JpaRepository<CheckinProgramReward, Long> {
    List<CheckinProgramReward> findByProgramIdOrderByDayNumberAsc(Long programId);
    void deleteByProgramId(Long programId);
}
