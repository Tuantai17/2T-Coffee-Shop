package com.rainbowforest.loyaltyservice.repository.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinFaq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinFaqRepository extends JpaRepository<CheckinFaq, Long> {
    List<CheckinFaq> findByStatusOrderByDisplayOrderAsc(String status);
}
