package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CheckinSettingRepository extends JpaRepository<CheckinSetting, Long> {
}
