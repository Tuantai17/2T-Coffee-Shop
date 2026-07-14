package com.rainbowforest.minigameservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin tóm tắt của một Mini Game (Dành cho trang chủ)")
public class GameResponse {

    @Schema(description = "ID của Game", example = "1")
    private Long id;

    @Schema(description = "Tên Game", example = "Vòng Quay May Mắn")
    private String name;

    @Schema(description = "Slug URL", example = "vong-quay-may-man")
    private String slug;

    @Schema(description = "Mã Game", example = "LUCKY_SPIN")
    private String code;

    @Schema(description = "Loại Game", example = "LUCKY_SPIN")
    private String type;

    @Schema(description = "URL ảnh thumbnail")
    private String thumbnailUrl;

    @Schema(description = "URL ảnh banner")
    private String bannerUrl;

    @Schema(description = "Mô tả ngắn")
    private String shortDescription;

    @Schema(description = "Giới hạn số lượt chơi một ngày", example = "5")
    private Integer dailyPlayLimit;

    @Schema(description = "Số lượt chơi còn lại của User", example = "3")
    private Integer remainingPlays;

    @Schema(description = "Đánh dấu Game nổi bật", example = "true")
    private Boolean featured;

    @Schema(description = "Cơ cấu giải thưởng hiển thị tóm tắt", example = "10 - 100 điểm, voucher")
    private String rewardRange;

    @Schema(description = "Danh sách phần thưởng có thể nhận")
    private List<RewardResponse> rewards;
}
