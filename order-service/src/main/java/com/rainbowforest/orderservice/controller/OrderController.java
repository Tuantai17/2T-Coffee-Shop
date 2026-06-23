package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.dto.CheckoutRequest;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cart-Id") String cartId,
            @RequestBody(required = false) CheckoutRequest checkoutRequest,
    		HttpServletRequest request){
    	
        List<Item> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        if(cart != null && user != null) {
        	Order order = this.createOrder(cart, user, checkoutRequest);
        	try{
                orderService.saveOrder(order);
                cartService.deleteCart(cartId);

                // Gửi event Kafka
                try {
                    Map<String, Object> orderEvent = new HashMap<>();
                    orderEvent.put("orderId", order.getId());
                    orderEvent.put("userId", userId);
                    orderEvent.put("total", order.getTotal());
                    orderEvent.put("status", order.getStatus());
                    orderEvent.put("paymentStatus", order.getPaymentStatus());
                    kafkaTemplate.send("order-events", orderEvent);
                } catch (Exception ke) {
                    System.err.println("Lỗi gửi Kafka event: " + ke.getMessage());
                }

                return new ResponseEntity<Order>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            }catch (Exception ex){
                ex.printStackTrace();
                return new ResponseEntity<Order>(
                		headerGenerator.getHeadersForError(),
                		HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        return new ResponseEntity<Order>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
    
    @GetMapping(value = "/order")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping(value = "/order/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable("userId") Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PutMapping(value = "/order/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        String paymentStatus = statusMap.get("paymentStatus");
        Order order = orderService.updateOrderStatus(orderId, status, paymentStatus);
        if (order != null) {
            return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    private Order createOrder(List<Item> cart, User user, CheckoutRequest checkoutRequest) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        BigDecimal subTotal = OrderUtilities.countTotalPrice(cart);
        BigDecimal discountAmount = OrderUtilities.resolveDiscountAmount(subTotal, checkoutRequest == null ? null : checkoutRequest.getVoucherCode());
        BigDecimal shippingFee = OrderUtilities.resolveShippingFee(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotal(subTotal.subtract(discountAmount).add(shippingFee));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PENDING_CONFIRMATION");
        order.setPaymentStatus(resolvePaymentStatus(checkoutRequest == null ? null : checkoutRequest.getPaymentMethod()));

        if (checkoutRequest != null) {
            order.setReceiverName(checkoutRequest.getReceiverName());
            order.setPhone(checkoutRequest.getPhone());
            order.setAddress(checkoutRequest.getAddress());
            order.setProvince(checkoutRequest.getProvince());
            order.setDistrict(checkoutRequest.getDistrict());
            order.setWard(checkoutRequest.getWard());
            order.setNote(checkoutRequest.getNote());
            order.setPaymentMethod(checkoutRequest.getPaymentMethod());
            order.setVoucherCode(checkoutRequest.getVoucherCode());
        }
        return order;
    }

    private String resolvePaymentStatus(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "PENDING";
        }
        return "COD".equalsIgnoreCase(paymentMethod) ? "PAYMENT_ON_DELIVERY" : "PENDING";
    }
}
