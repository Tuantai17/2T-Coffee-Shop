package com.rainbowforest.minigameservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin bảng xếp hạng")
public class LeaderboardResponse {
    @Schema(description = "ID Người chơi")
    private Long userId;
    
    @Schema(description = "Tên hiển thị (Tạm thời ẩn danh)")
    private String displayName;
    
    @Schema(description = "URL Ảnh đại diện (Tạm thời null)")
    private String avatarUrl;
    
    @Schema(description = "Điểm số đạt được")
    private Long score;
    
    @Schema(description = "Thứ hạng")
    private Integer rank;
    
    @Schema(description = "Tổng số lượt đã chơi")
    private Long playCount;
    
    @Schema(description = "Thời gian hoàn thành ngắn nhất (giây)")
    private Integer bestTime;
}
