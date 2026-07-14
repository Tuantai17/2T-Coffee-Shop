package com.rainbowforest.loyaltyservice.scheduler;

import com.rainbowforest.loyaltyservice.client.UserServiceClient;
import com.rainbowforest.loyaltyservice.client.UserServiceUser;
import com.rainbowforest.loyaltyservice.domain.DailyCheckin;
import com.rainbowforest.loyaltyservice.repository.DailyCheckinRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class CheckinReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(CheckinReminderScheduler.class);

    private final UserServiceClient userServiceClient;
    private final DailyCheckinRepository dailyCheckinRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Value("${app.kafka.topics.notification-events:notification-events}")
    private String notificationTopic;

    public CheckinReminderScheduler(UserServiceClient userServiceClient,
                                    DailyCheckinRepository dailyCheckinRepository,
                                    KafkaTemplate<String, Object> kafkaTemplate) {
        this.userServiceClient = userServiceClient;
        this.dailyCheckinRepository = dailyCheckinRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    // Run every day at 15:00 (3 PM)
    @Scheduled(cron = "0 0 15 * * ?")
    public void sendDailyCheckinReminders() {
        log.info("Starting Daily Checkin Reminder Job...");
        try {
            List<UserServiceUser> allUsers = userServiceClient.getAllUsers();
            LocalDate today = LocalDate.now();

            for (UserServiceUser user : allUsers) {
                if (user.userDetails() == null || user.userDetails().email() == null || user.userDetails().email().isBlank()) {
                    continue;
                }

                Optional<DailyCheckin> checkinOpt = dailyCheckinRepository.findByUserIdAndCheckinDate(user.id(), today);
                if (checkinOpt.isEmpty()) {
                    // Send reminder event
                    Map<String, Object> event = new HashMap<>();
                    event.put("eventId", "DAILY_CHECKIN_REMINDER:" + user.id() + ":" + today.toString());
                    event.put("eventType", "DAILY_CHECKIN_REMINDER");
                    event.put("userId", user.id());
                    event.put("recipientEmail", user.userDetails().email());
                    
                    String fullName = user.userDetails().firstName();
                    if (user.userDetails().lastName() != null) {
                        fullName += " " + user.userDetails().lastName();
                    }
                    event.put("recipientName", fullName != null && !fullName.isBlank() ? fullName : "Customer");
                    event.put("occurredAt", DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))));
                    
                    kafkaTemplate.send(notificationTopic, event);
                    log.info("Sent checkin reminder to user {}", user.id());
                }
            }
        } catch (Exception ex) {
            log.error("Failed to run Daily Checkin Reminder Job", ex);
        }
        log.info("Finished Daily Checkin Reminder Job.");
    }
}
