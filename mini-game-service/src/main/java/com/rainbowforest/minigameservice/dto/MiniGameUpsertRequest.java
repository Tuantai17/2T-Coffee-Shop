package com.rainbowforest.minigameservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record MiniGameUpsertRequest(
        @NotBlank(message = "Tên game là bắt buộc")
        @Size(max = 150, message = "Tên game tối đa 150 ký tự")
        String name,

        @NotBlank(message = "Slug là bắt buộc")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ được gồm chữ thường, số và dấu gạch ngang")
        @Size(max = 160, message = "Slug tối đa 160 ký tự")
        String slug,

        @NotBlank(message = "Mã game là bắt buộc")
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "Code chỉ được gồm chữ in hoa, số và dấu gạch dưới")
        @Size(max = 100, message = "Code tối đa 100 ký tự")
        String code,

        @NotBlank(message = "Loại game là bắt buộc")
        String type,

        @Size(max = 500, message = "Thumbnail tối đa 500 ký tự")
        String thumbnailUrl,

        @Size(max = 500, message = "Banner tối đa 500 ký tự")
        String bannerUrl,

        @Size(max = 500, message = "Mô tả ngắn tối đa 500 ký tự")
        String shortDescription,

        String description,
        String rules,

        @Min(value = 0, message = "Giới hạn lượt chơi không được âm")
        Integer dailyPlayLimit,

        @NotBlank(message = "Trạng thái là bắt buộc")
        String status,
        Boolean visible,
        Boolean featured,

        @NotBlank(message = "Phiên bản là bắt buộc")
        @Size(max = 30, message = "Phiên bản tối đa 30 ký tự")
        String version,

        Map<String, Object> gameplayConfig
) {
}
