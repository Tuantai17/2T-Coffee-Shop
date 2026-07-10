package com.rainbowforest.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.domain.Refund;
import com.rainbowforest.orderservice.domain.OutboxEvent;
import com.rainbowforest.orderservice.dto.RefundRequestDTO;
import com.rainbowforest.orderservice.dto.RefundItemRequestDTO;
import com.rainbowforest.orderservice.repository.ItemRepository;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.rainbowforest.orderservice.repository.OutboxEventRepository;
import com.rainbowforest.orderservice.repository.ProductRepository;
import com.rainbowforest.orderservice.repository.RefundRepository;
import com.rainbowforest.orderservice.job.OutboxPublisherJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "spring.flyway.enabled=false")
@ActiveProfiles("test")
public class OutboxEventIntegrationTest {

    @Autowired
    private AdminOrderServiceImpl adminOrderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private OutboxPublisherJob outboxPublisherJob;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @MockBean
    private com.rainbowforest.orderservice.feignclient.ProductClient productClient;

    private Order testOrder;
    private Item testItem;

    @BeforeEach
    public void setup() {
        Product p = new Product();
        p.setId(100L);
        p.setProductName("Test Product");
        p.setPrice(new BigDecimal("100000"));
        p = productRepository.save(p);

        testOrder = new Order();
        testOrder.setStatus("PENDING");
        testOrder.setPaymentStatus("PAID");
        testOrder.setOrderedDate(java.time.LocalDateTime.now());
        testOrder.setTotal(new BigDecimal("200000"));
        testOrder.setItems(new ArrayList<>());
        testOrder = orderRepository.save(testOrder);

        testItem = new Item();
        java.util.List<Order> ordersList = new java.util.ArrayList<>();
        ordersList.add(testOrder);
        testItem.setOrders(ordersList);
        testItem.setProduct(p);
        testItem.setQuantity(2);
        testItem.setSubTotal(new BigDecimal("200000"));
        testItem.setUnitPrice(new BigDecimal("100000"));
        testItem = itemRepository.save(testItem);

        java.util.List<Item> newItems = new java.util.ArrayList<>(testOrder.getItems());
        newItems.add(testItem);
        testOrder.setItems(newItems);
        testOrder = orderRepository.save(testOrder);
    }

    @Test
    @Transactional
    public void test1_CancelOrder_CreatesOneOutboxEvent() {
        adminOrderService.cancelOrder(testOrder.getId(), "Khách đổi ý", "System");
        long eventCount = outboxEventRepository.findAll().stream()
                .filter(e -> e.getBusinessKey().equals("ORDER_CANCELLED:" + testOrder.getId()))
                .count();
        assertEquals(1, eventCount);
    }

    @Test
    public void test2_ConcurrentCancel_CreatesOneEvent() throws InterruptedException {
        int threads = 3;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            executor.execute(() -> {
                try {
                    adminOrderService.cancelOrder(testOrder.getId(), "Khách đổi ý", "System");
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // expected concurrent/optimistic exception
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();
        executor.shutdown();
        
        long eventCount = outboxEventRepository.findAll().stream()
                .filter(e -> e.getBusinessKey().equals("ORDER_CANCELLED:" + testOrder.getId()))
                .count();
        assertEquals(1, eventCount);
    }

    @Test
    @Transactional
    public void test3_CancelTwice_ThrowsException() {
        adminOrderService.cancelOrder(testOrder.getId(), "Khách đổi ý", "System");
        assertThrows(RuntimeException.class, () -> {
            adminOrderService.cancelOrder(testOrder.getId(), "Lần 2", "System");
        });
    }

    @Test
    @Transactional
    public void test4_FullRefund_CreatesRefundCompletedEvent() {
        adminOrderService.cancelOrder(testOrder.getId(), "Hủy", "System");
        
        RefundRequestDTO req = new RefundRequestDTO();
        req.setIdempotencyKey("REF-TEST-004");
        req.setRefundType("FULL");
        
        Refund refund = adminOrderService.confirmRefund(testOrder.getId(), req, "Admin");
        
        assertEquals("COMPLETED", refund.getStatus());
        
        long eventCount = outboxEventRepository.findAll().stream()
                .filter(e -> e.getBusinessKey().equals("REFUND_COMPLETED:" + refund.getId()))
                .count();
        assertEquals(1, eventCount);
        
        Order updatedOrder = orderRepository.findById(testOrder.getId()).get();
        assertEquals("REFUNDED", updatedOrder.getPaymentStatus());
    }

    @Test
    @Transactional
    public void test5_PartialRefund_PaymentStatusIsPartiallyRefunded() {
        adminOrderService.cancelOrder(testOrder.getId(), "Hủy", "System");
        
        RefundRequestDTO req = new RefundRequestDTO();
        req.setIdempotencyKey("REF-TEST-005");
        req.setRefundType("PARTIAL");
        RefundItemRequestDTO itemReq = new RefundItemRequestDTO();
        itemReq.setOrderItemId(testItem.getId());
        itemReq.setQuantity(1); // 1 out of 2
        req.setItems(List.of(itemReq));
        
        adminOrderService.confirmRefund(testOrder.getId(), req, "Admin");
        
        Order updatedOrder = orderRepository.findById(testOrder.getId()).get();
        assertEquals("PARTIALLY_REFUNDED", updatedOrder.getPaymentStatus());
    }

    @Test
    @Transactional
    public void test6_RefundItems_ExceedsOrderedQuantity() {
        adminOrderService.cancelOrder(testOrder.getId(), "Hủy", "System");
        
        RefundRequestDTO req = new RefundRequestDTO();
        req.setIdempotencyKey("REF-TEST-006");
        req.setRefundType("PARTIAL");
        RefundItemRequestDTO itemReq = new RefundItemRequestDTO();
        itemReq.setOrderItemId(testItem.getId());
        itemReq.setQuantity(3); // ordered is 2
        req.setItems(List.of(itemReq));
        
        assertThrows(IllegalArgumentException.class, () -> {
            adminOrderService.confirmRefund(testOrder.getId(), req, "Admin");
        });
    }

    @Test
    @Transactional
    public void test7_RefundExceedsRemainingAmount() {
        adminOrderService.cancelOrder(testOrder.getId(), "Hủy", "System");
        
        // 1st partial refund
        RefundRequestDTO req1 = new RefundRequestDTO();
        req1.setIdempotencyKey("REF-TEST-007-1");
        req1.setRefundType("PARTIAL");
        RefundItemRequestDTO itemReq1 = new RefundItemRequestDTO();
        itemReq1.setOrderItemId(testItem.getId());
        itemReq1.setQuantity(2);
        req1.setItems(List.of(itemReq1));
        
        adminOrderService.confirmRefund(testOrder.getId(), req1, "Admin");
        
        // 2nd partial refund should fail because nothing left
        RefundRequestDTO req2 = new RefundRequestDTO();
        req2.setIdempotencyKey("REF-TEST-007-2");
        req2.setRefundType("PARTIAL");
        RefundItemRequestDTO itemReq2 = new RefundItemRequestDTO();
        itemReq2.setOrderItemId(testItem.getId());
        itemReq2.setQuantity(1);
        req2.setItems(List.of(itemReq2));
        
        assertThrows(IllegalArgumentException.class, () -> {
            adminOrderService.confirmRefund(testOrder.getId(), req2, "Admin");
        });
    }

    @Test
    @Transactional
    public void test8_SameIdempotencyKey_ReturnsSameRefund() {
        adminOrderService.cancelOrder(testOrder.getId(), "Hủy", "System");
        
        RefundRequestDTO req = new RefundRequestDTO();
        req.setIdempotencyKey("REF-TEST-008");
        req.setRefundType("FULL");
        
        Refund r1 = adminOrderService.confirmRefund(testOrder.getId(), req, "Admin");
        Refund r2 = adminOrderService.confirmRefund(testOrder.getId(), req, "Admin");
        
        assertEquals(r1.getId(), r2.getId());
    }

    @Test
    @Transactional
    public void test9_SameKeyDifferentPayload_Throws409() {
        adminOrderService.cancelOrder(testOrder.getId(), "Hủy", "System");
        
        RefundRequestDTO req1 = new RefundRequestDTO();
        req1.setIdempotencyKey("REF-TEST-009");
        req1.setRefundType("FULL");
        
        adminOrderService.confirmRefund(testOrder.getId(), req1, "Admin");
        
        RefundRequestDTO req2 = new RefundRequestDTO();
        req2.setIdempotencyKey("REF-TEST-009");
        req2.setRefundType("PARTIAL");
        RefundItemRequestDTO itemReq = new RefundItemRequestDTO();
        itemReq.setOrderItemId(testItem.getId());
        itemReq.setQuantity(1);
        req2.setItems(List.of(itemReq));
        
        assertThrows(IllegalStateException.class, () -> {
            adminOrderService.confirmRefund(testOrder.getId(), req2, "Admin");
        });
    }

    @Test
    @Transactional
    public void test10_KafkaDown_RetryCountIncreases() throws Exception {
        adminOrderService.cancelOrder(testOrder.getId(), "System", "System");
        
        // Simulate Kafka Exception
        when(kafkaTemplate.send(anyString(), anyString())).thenThrow(new RuntimeException("Kafka Timeout"));
        
        outboxPublisherJob.publishPendingEvents();
        
        OutboxEvent event = outboxEventRepository.findAll().get(0);
        assertEquals("PENDING", event.getStatus());
        assertEquals(1, event.getRetryCount());
        assertNotNull(event.getErrorMessage());
    }

    @Test
    @Transactional
    public void test11_KafkaBack_EventPublished() throws Exception {
        adminOrderService.cancelOrder(testOrder.getId(), "System", "System");
        
        // Mock successful future
        java.util.concurrent.CompletableFuture<org.springframework.kafka.support.SendResult<String, String>> future = 
            new java.util.concurrent.CompletableFuture<>();
        future.complete(null);
        when(kafkaTemplate.send(anyString(), anyString())).thenReturn(future);
        
        outboxPublisherJob.publishPendingEvents();
        
        OutboxEvent event = outboxEventRepository.findAll().get(0);
        assertEquals("PUBLISHED", event.getStatus());
        assertNotNull(event.getPublishedAt());
    }

    @Test
    @Transactional
    public void test13_EventProcessingStuck_Recovered() {
        OutboxEvent stuck = new OutboxEvent("test", "TEST", "{}");
        stuck.setStatus("PROCESSING");
        stuck.setProcessingStartedAt(java.time.LocalDateTime.now().minusMinutes(6)); // Over 5 mins
        outboxEventRepository.save(stuck);
        
        List<OutboxEvent> claimed = outboxEventRepository.findPendingEventsForProcessing(java.time.LocalDateTime.now().minusMinutes(5));
        assertEquals(1, claimed.size());
        assertEquals(stuck.getId(), claimed.get(0).getId());
    }
}
