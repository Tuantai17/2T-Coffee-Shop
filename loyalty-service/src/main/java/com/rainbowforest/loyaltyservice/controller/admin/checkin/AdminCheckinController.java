package com.rainbowforest.loyaltyservice.controller.admin.checkin;

import com.rainbowforest.loyaltyservice.domain.checkin.CheckinConfig;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinCalendarEvent;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinMission;
import com.rainbowforest.loyaltyservice.domain.checkin.MysteryBox;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinAchievement;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinFaq;
import com.rainbowforest.loyaltyservice.domain.checkin.UserCheckinStreak;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRecord;
import com.rainbowforest.loyaltyservice.domain.checkin.CheckinRewardCycle;
import java.util.List;
import com.rainbowforest.loyaltyservice.service.checkin.CheckinAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    

    @GetMapping("/reward-cycles")
    public ResponseEntity<List<CheckinRewardCycle>> getAllRewardCycles() {
        return ResponseEntity.ok(adminService.getAllRewardCycles());
    }

    @GetMapping("/reward-cycles/{id}")
    public ResponseEntity<CheckinRewardCycle> getRewardCycle(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRewardCycle(id));
    }

    @PostMapping("/reward-cycles")
    public ResponseEntity<CheckinRewardCycle> createRewardCycle(@RequestBody CheckinRewardCycle cycle) {
        return ResponseEntity.ok(adminService.createRewardCycle(cycle));
    }

    @PutMapping("/reward-cycles/{id}")
    public ResponseEntity<CheckinRewardCycle> updateRewardCycle(@PathVariable Long id, @RequestBody CheckinRewardCycle cycle) {
        return ResponseEntity.ok(adminService.updateRewardCycle(id, cycle));
    }

    @DeleteMapping("/reward-cycles/{id}")
    public ResponseEntity<Void> deleteRewardCycle(@PathVariable Long id) {
        adminService.deleteRewardCycle(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/reward-cycles/{id}/status")
    public ResponseEntity<CheckinRewardCycle> updateRewardCycleStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateRewardCycleStatus(id, payload.get("status")));
    }


    @GetMapping("/calendar-events")
    public ResponseEntity<List<CheckinCalendarEvent>> getAllCalendarEvents() {
        return ResponseEntity.ok(adminService.getAllCalendarEvents());
    }

    @GetMapping("/calendar-events/{id}")
    public ResponseEntity<CheckinCalendarEvent> getCalendarEvent(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getCalendarEvent(id));
    }

    @PostMapping("/calendar-events")
    public ResponseEntity<CheckinCalendarEvent> createCalendarEvent(@RequestBody CheckinCalendarEvent event) {
        return ResponseEntity.ok(adminService.createCalendarEvent(event));
    }

    @PutMapping("/calendar-events/{id}")
    public ResponseEntity<CheckinCalendarEvent> updateCalendarEvent(@PathVariable Long id, @RequestBody CheckinCalendarEvent event) {
        return ResponseEntity.ok(adminService.updateCalendarEvent(id, event));
    }

    @DeleteMapping("/calendar-events/{id}")
    public ResponseEntity<Void> deleteCalendarEvent(@PathVariable Long id) {
        adminService.deleteCalendarEvent(id);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/missions")
    public ResponseEntity<List<CheckinMission>> getAllMissions() {
        return ResponseEntity.ok(adminService.getAllMissions());
    }

    @GetMapping("/missions/{id}")
    public ResponseEntity<CheckinMission> getMission(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getMission(id));
    }

    @PostMapping("/missions")
    public ResponseEntity<CheckinMission> createMission(@RequestBody CheckinMission mission) {
        return ResponseEntity.ok(adminService.createMission(mission));
    }

    @PutMapping("/missions/{id}")
    public ResponseEntity<CheckinMission> updateMission(@PathVariable Long id, @RequestBody CheckinMission mission) {
        return ResponseEntity.ok(adminService.updateMission(id, mission));
    }

    @DeleteMapping("/missions/{id}")
    public ResponseEntity<Void> deleteMission(@PathVariable Long id) {
        adminService.deleteMission(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/missions/{id}/status")
    public ResponseEntity<CheckinMission> updateMissionStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateMissionStatus(id, payload.get("status")));
    }


    @GetMapping("/mystery-boxes")
    public ResponseEntity<List<MysteryBox>> getAllMysteryBoxes() {
        return ResponseEntity.ok(adminService.getAllMysteryBoxes());
    }

    @GetMapping("/mystery-boxes/{id}")
    public ResponseEntity<MysteryBox> getMysteryBox(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getMysteryBox(id));
    }

    @PostMapping("/mystery-boxes")
    public ResponseEntity<MysteryBox> createMysteryBox(@RequestBody MysteryBox box) {
        return ResponseEntity.ok(adminService.createMysteryBox(box));
    }

    @PutMapping("/mystery-boxes/{id}")
    public ResponseEntity<MysteryBox> updateMysteryBox(@PathVariable Long id, @RequestBody MysteryBox box) {
        return ResponseEntity.ok(adminService.updateMysteryBox(id, box));
    }

    @DeleteMapping("/mystery-boxes/{id}")
    public ResponseEntity<Void> deleteMysteryBox(@PathVariable Long id) {
        adminService.deleteMysteryBox(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/mystery-boxes/{id}/status")
    public ResponseEntity<MysteryBox> updateMysteryBoxStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateMysteryBoxStatus(id, payload.get("status")));
    }


    @GetMapping("/achievements")
    public ResponseEntity<List<CheckinAchievement>> getAllAchievements() {
        return ResponseEntity.ok(adminService.getAllAchievements());
    }

    @GetMapping("/achievements/{id}")
    public ResponseEntity<CheckinAchievement> getAchievement(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAchievement(id));
    }

    @PostMapping("/achievements")
    public ResponseEntity<CheckinAchievement> createAchievement(@RequestBody CheckinAchievement achievement) {
        return ResponseEntity.ok(adminService.createAchievement(achievement));
    }

    @PutMapping("/achievements/{id}")
    public ResponseEntity<CheckinAchievement> updateAchievement(@PathVariable Long id, @RequestBody CheckinAchievement achievement) {
        return ResponseEntity.ok(adminService.updateAchievement(id, achievement));
    }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<Void> deleteAchievement(@PathVariable Long id) {
        adminService.deleteAchievement(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/achievements/{id}/status")
    public ResponseEntity<CheckinAchievement> updateAchievementStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateAchievementStatus(id, payload.get("status")));
    }


    @GetMapping("/users")
    public ResponseEntity<List<UserCheckinStreak>> getAllUserStreaks() {
        return ResponseEntity.ok(adminService.getAllUserStreaks());
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<CheckinRecord>> getAllCheckinRecords() {
        return ResponseEntity.ok(adminService.getAllCheckinRecords());
    }


    @GetMapping("/faq")
    public ResponseEntity<List<CheckinFaq>> getAllFaqs() {
        return ResponseEntity.ok(adminService.getAllFaqs());
    }

    @GetMapping("/faq/{id}")
    public ResponseEntity<CheckinFaq> getFaq(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getFaq(id));
    }

    @PostMapping("/faq")
    public ResponseEntity<CheckinFaq> createFaq(@RequestBody CheckinFaq faq) {
        return ResponseEntity.ok(adminService.createFaq(faq));
    }

    @PutMapping("/faq/{id}")
    public ResponseEntity<CheckinFaq> updateFaq(@PathVariable Long id, @RequestBody CheckinFaq faq) {
        return ResponseEntity.ok(adminService.updateFaq(id, faq));
    }

    @DeleteMapping("/faq/{id}")
    public ResponseEntity<Void> deleteFaq(@PathVariable Long id) {
        adminService.deleteFaq(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/faq/{id}/status")
    public ResponseEntity<CheckinFaq> updateFaqStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateFaqStatus(id, payload.get("status")));
    }

    @GetMapping("/config")
    public ResponseEntity<CheckinConfig> getConfig() {
        return ResponseEntity.ok(adminService.getConfig());
    }
    
    @PutMapping("/config")
    public ResponseEntity<CheckinConfig> updateConfig(@RequestBody CheckinConfig config) {
        return ResponseEntity.ok(adminService.saveConfig(config));
    }
}
