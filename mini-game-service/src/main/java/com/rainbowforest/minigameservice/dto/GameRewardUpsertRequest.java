package com.rainbowforest.minigameservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record GameRewardUpsertRequest(
        @NotBlank(message = "Tên phần thưởng là bắt buộc")
        @Size(max = 150, message = "Tên phần thưởng tối đa 150 ký tự")
        String rewardName,

        @NotBlank(message = "Loại phần thưởng là bắt buộc")
        String rewardType,

        Long pointValue,
        @Size(max = 100, message = "Voucher tối đa 100 ký tự")
        String voucherId,

        @NotNull(message = "Xác suất là bắt buộc")
        @DecimalMin(value = "0.0", inclusive = true, message = "Xác suất phải từ 0 đến 100")
        @DecimalMax(value = "100.0", inclusive = true, message = "Xác suất phải từ 0 đến 100")
        BigDecimal probability,

        @NotNull(message = "Tổng số lượng là bắt buộc")
        @Min(value = 0, message = "Tổng số lượng không được âm")
        Integer totalQuantity,

        @NotNull(message = "Số lượng còn lại là bắt buộc")
        @Min(value = 0, message = "Số lượng còn lại không được âm")
        Integer remainingQuantity,

        @NotBlank(message = "Trạng thái là bắt buộc")
        String status
) {
}
