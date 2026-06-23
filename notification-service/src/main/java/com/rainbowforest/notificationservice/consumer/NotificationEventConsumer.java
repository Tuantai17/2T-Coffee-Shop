package com.rainbowforest.notificationservice.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@Service
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void consumeOrderEvent(Map<String, Object> orderEvent) {
        log.info("=================================================");
        log.info("NOTIFICATION SERVICE: Nhận sự kiện Order từ Kafka!");
        log.info("Mã đơn hàng: {}", orderEvent.get("orderId"));
        log.info("Khách hàng: ID #{}", orderEvent.get("userId"));
        log.info("GỬI THÔNG BÁO: Đơn hàng #{} đã được tạo thành công!", orderEvent.get("orderId"));
        log.info("Tổng số tiền thanh toán dự kiến: {}", orderEvent.get("total"));
        log.info("Email thông báo đã được gửi giả lập tới người dùng.");
        log.info("=================================================");
    }
}
