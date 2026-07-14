package com.rainbowforest.loyaltyservice.controller.admin.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.*;
import com.rainbowforest.loyaltyservice.dto.checkin.AdminCheckinHistoryItem;
import com.rainbowforest.loyaltyservice.dto.checkin.AdminCheckinProgramDetailResponse;
import com.rainbowforest.loyaltyservice.dto.checkin.AdminCheckinProgramPayload;
import com.rainbowforest.loyaltyservice.service.checkin.CheckinAdminService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/check-ins")
public class AdminCheckinController {
    
    @Autowired
    private CheckinAdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // --- Programs ---
    @GetMapping("/programs")
    public ResponseEntity<List<Map<String, Object>>> getAllPrograms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminService.getAllPrograms(search, status));
    }

    @GetMapping("/programs/{id}")
    public ResponseEntity<AdminCheckinProgramDetailResponse> getProgram(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getProgram(id));
    }

    @PostMapping("/programs")
    public ResponseEntity<AdminCheckinProgramDetailResponse> createProgram(@RequestBody AdminCheckinProgramPayload program) {
        return ResponseEntity.ok(adminService.createProgram(program));
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<AdminCheckinProgramDetailResponse> updateProgram(@PathVariable Long id, @RequestBody AdminCheckinProgramPayload program) {
        return ResponseEntity.ok(adminService.updateProgram(id, program));
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        adminService.deleteProgram(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/programs/{id}/status")
    public ResponseEntity<Map<String, Object>> updateProgramStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateProgramStatus(id, payload.get("status")));
    }

    @PostMapping("/programs/{id}/duplicate")
    public ResponseEntity<Map<String, Object>> duplicateProgram(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.duplicateProgram(id));
    }

    // --- Rewards ---
    @GetMapping("/programs/{id}/rewards")
    public ResponseEntity<List<CheckinProgramReward>> getProgramRewards(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getProgramRewards(id));
    }

    @PutMapping("/programs/{id}/rewards")
    public ResponseEntity<List<CheckinProgramReward>> saveProgramRewards(@PathVariable Long id, @RequestBody List<CheckinProgramReward> rewards) {
        return ResponseEntity.ok(adminService.saveProgramRewards(id, rewards));
    }

    // --- Settings ---
    @GetMapping("/settings")
    public ResponseEntity<CheckinSetting> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<CheckinSetting> updateSettings(@RequestBody CheckinSetting settings) {
        return ResponseEntity.ok(adminService.saveSettings(settings));
    }

    // --- History ---
    @GetMapping("/history")
    public ResponseEntity<List<AdminCheckinHistoryItem>> getHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(adminService.getAllHistory(search, programId, status, fromDate, toDate));
    }

    @GetMapping("/history/export")
    public ResponseEntity<byte[]> exportHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        byte[] data = adminService.exportHistoryCsv(search, programId, status, fromDate, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=checkin-history.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistoryRecord(@PathVariable Long id) {
        adminService.deleteHistoryRecord(id);
        return ResponseEntity.ok().build();
    }
}
