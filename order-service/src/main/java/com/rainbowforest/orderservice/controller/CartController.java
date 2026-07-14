package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CartController {

    @Autowired
    CartService cartService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping (value = "/cart")
    public ResponseEntity<List<Object>> getCart(@RequestHeader(value = "Cart-Id") String cartId){
        List<Object> cart = cartService.getCart(cartId);

        return new ResponseEntity<List<Object>>(
        			cart,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
    }

    @PostMapping(value = "/cart")
    public ResponseEntity<List<Object>> addItemToCart(
            @RequestBody com.rainbowforest.orderservice.dto.CartItemRequest request,
            @RequestHeader(value = "Cart-Id") String cartId,
            HttpServletRequest req) {
        
        cartService.addItemToCart(cartId, request);
        List<Object> updatedCart = cartService.getCart(cartId);
        return new ResponseEntity<List<Object>>(
                updatedCart,
                headerGenerator.getHeadersForSuccessPostMethod(req, Long.parseLong(cartId)),
                HttpStatus.CREATED);
    }

    @PutMapping(value = "/cart")
    public ResponseEntity<List<Object>> updateItemQuantity(
            @RequestParam("cartItemId") String cartItemId,
            @RequestParam("quantity") Integer quantity,
            @RequestHeader(value = "Cart-Id") String cartId,
            HttpServletRequest req) {
        
        if (cartService.checkIfItemIsExist(cartId, cartItemId)) {
            cartService.changeItemQuantity(cartId, cartItemId, quantity);
            List<Object> updatedCart = cartService.getCart(cartId);
            return new ResponseEntity<List<Object>>(
                    updatedCart,
                    headerGenerator.getHeadersForSuccessPostMethod(req, Long.parseLong(cartId)),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Object>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/cart", params = "cartItemId")
    public ResponseEntity<Void> removeItemFromCart(
            @RequestParam("cartItemId") String cartItemId,
            @RequestHeader(value = "Cart-Id") String cartId){
        if (cartService.checkIfItemIsExist(cartId, cartItemId)) {
            cartService.deleteItemFromCart(cartId, cartItemId);
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<java.util.Map<String, String>> handleException(Exception e) {
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
