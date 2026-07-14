package com.rainbowforest.loyaltyservice.dto.checkin;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminCheckinHistoryItem(
        Long id,
        Long programId,
        String programCode,
        String programName,
        Long userId,
        String userName,
        String email,
        LocalDate businessDate,
        LocalDateTime checkinTime,
        Integer dayNumber,
        Integer streakAfter,
        Integer pointsAwarded,
        String voucherId,
        String status
) {
}
