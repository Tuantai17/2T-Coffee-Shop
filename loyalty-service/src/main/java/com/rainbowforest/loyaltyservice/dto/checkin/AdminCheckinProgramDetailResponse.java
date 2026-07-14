package com.rainbowforest.loyaltyservice.dto.checkin;

import java.util.List;
import java.util.Map;

public record AdminCheckinProgramDetailResponse(
        Map<String, Object> program,
        List<Map<String, Object>> rewards,
        List<Map<String, Object>> luckyDays,
        Map<String, Object> stats
) {
}
