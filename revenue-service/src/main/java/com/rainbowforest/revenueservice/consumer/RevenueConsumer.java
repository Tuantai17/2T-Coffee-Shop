package com.rainbowforest.revenueservice.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.revenueservice.domain.*;
import com.rainbowforest.revenueservice.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class RevenueConsumer {

    private static final Logger log = LoggerFactory.getLogger(RevenueConsumer.class);

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private DailyRevenueRepository dailyRevenueRepository;

    @Autowired
    private ProductStatRepository productStatRepository;

    @Autowired
    private ToppingStatRepository toppingStatRepository;

    @Autowired
    private InteractionStatRepository interactionStatRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = {"order-events", "loyalty-events"}, groupId = "revenue-group")
    @Transactional
    public void processEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventId = root.path("eventId").asText();
            String eventType = root.path("eventType").asText();

            if (eventId == null || eventId.isBlank()) return;

            try {
                processedEventRepository.save(new ProcessedEvent(null, eventId, eventType, null));
            } catch (DuplicateKeyException ex) {
                log.info("Duplicate event detected, ignoring: {}", eventId);
                return;
            }

            JsonNode payload = root.path("payload");
            
            if ("ORDER_CREATED".equals(eventType) || "ORDER_COMPLETED".equals(eventType)) {
                // To keep it simple, we record revenue on ORDER_COMPLETED
                if ("ORDER_COMPLETED".equals(eventType)) {
                    handleOrderCompleted(payload);
                }
            } else if ("CHECKIN_REWARD_GRANTED".equals(eventType)) {
                handleCheckinReward();
            } else if ("MINIGAME_REWARD_GRANTED".equals(eventType)) {
                handleMinigameReward();
            }

        } catch (Exception ex) {
            log.error("Failed to process event for revenue: {}", ex.getMessage());
            throw new RuntimeException(ex);
        }
    }

    private void handleOrderCompleted(JsonNode payload) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DailyRevenue dailyRevenue = dailyRevenueRepository.findById(today).orElseGet(() -> 
            DailyRevenue.builder()
                .date(today)
                .totalOrders(0L)
                .totalRevenue(BigDecimal.ZERO)
                .deliveryRevenue(BigDecimal.ZERO)
                .pickupRevenue(BigDecimal.ZERO)
                .build()
        );

        dailyRevenue.setTotalOrders(dailyRevenue.getTotalOrders() + 1);
        
        BigDecimal totalAmount = new BigDecimal(payload.path("finalAmount").asText("0"));
        dailyRevenue.setTotalRevenue(dailyRevenue.getTotalRevenue().add(totalAmount));

        String fulfillmentType = payload.path("fulfillmentType").asText("PICKUP");
        if ("DELIVERY".equals(fulfillmentType)) {
            dailyRevenue.setDeliveryRevenue(dailyRevenue.getDeliveryRevenue().add(totalAmount));
        } else {
            dailyRevenue.setPickupRevenue(dailyRevenue.getPickupRevenue().add(totalAmount));
        }

        dailyRevenueRepository.save(dailyRevenue);

        JsonNode items = payload.path("items");
        if (items.isArray()) {
            for (JsonNode item : items) {
                Long productId = item.path("productId").asLong();
                String productName = item.path("productName").asText();
                Long quantity = item.path("quantity").asLong();
                BigDecimal price = new BigDecimal(item.path("price").asText("0"));
                BigDecimal itemRevenue = price.multiply(new BigDecimal(quantity));

                ProductStat productStat = productStatRepository.findById(productId).orElseGet(() ->
                    ProductStat.builder()
                        .productId(productId)
                        .productName(productName)
                        .totalQuantity(0L)
                        .totalRevenue(BigDecimal.ZERO)
                        .build()
                );
                productStat.setTotalQuantity(productStat.getTotalQuantity() + quantity);
                productStat.setTotalRevenue(productStat.getTotalRevenue().add(itemRevenue));
                productStatRepository.save(productStat);

                JsonNode toppings = item.path("toppings");
                if (toppings.isArray()) {
                    for (JsonNode topping : toppings) {
                        Long toppingId = topping.path("id").asLong();
                        String toppingName = topping.path("name").asText();
                        BigDecimal toppingPrice = new BigDecimal(topping.path("price").asText("0"));
                        BigDecimal toppingRevenue = toppingPrice.multiply(new BigDecimal(quantity));

                        ToppingStat toppingStat = toppingStatRepository.findById(toppingId).orElseGet(() ->
                            ToppingStat.builder()
                                .toppingId(toppingId)
                                .toppingName(toppingName)
                                .totalQuantity(0L)
                                .totalRevenue(BigDecimal.ZERO)
                                .build()
                        );
                        toppingStat.setTotalQuantity(toppingStat.getTotalQuantity() + quantity);
                        toppingStat.setTotalRevenue(toppingStat.getTotalRevenue().add(toppingRevenue));
                        toppingStatRepository.save(toppingStat);
                    }
                }
            }
        }
    }

    private void handleCheckinReward() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        InteractionStat stat = interactionStatRepository.findById(today).orElseGet(() ->
            InteractionStat.builder().date(today).checkinCount(0L).minigameCount(0L).build()
        );
        stat.setCheckinCount(stat.getCheckinCount() + 1);
        interactionStatRepository.save(stat);
    }

    private void handleMinigameReward() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        InteractionStat stat = interactionStatRepository.findById(today).orElseGet(() ->
            InteractionStat.builder().date(today).checkinCount(0L).minigameCount(0L).build()
        );
        stat.setMinigameCount(stat.getMinigameCount() + 1);
        interactionStatRepository.save(stat);
    }
}
