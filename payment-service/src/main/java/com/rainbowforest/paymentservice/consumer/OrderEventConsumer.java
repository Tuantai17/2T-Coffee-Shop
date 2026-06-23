package com.rainbowforest.paymentservice.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@Service
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void consumeOrderEvent(Map<String, Object> orderEvent) {
        log.info("=================================================");
        log.info("PAYMENT SERVICE: Nhận sự kiện Order từ Kafka!");
        log.info("Mã đơn hàng: {}", orderEvent.get("orderId"));
        log.info("Mã người dùng: {}", orderEvent.get("userId"));
        log.info("Tổng tiền: {}", orderEvent.get("total"));
        log.info("Trạng thái hiện tại: {}", orderEvent.get("status"));
        log.info("Đang tiến hành xử lý thanh toán giả lập...");
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            log.error("Lỗi khi xử lý giả lập thanh toán", e);
        }
        log.info("Thanh toán thành công cho đơn hàng #{}", orderEvent.get("orderId"));
        log.info("=================================================");
    }
}
