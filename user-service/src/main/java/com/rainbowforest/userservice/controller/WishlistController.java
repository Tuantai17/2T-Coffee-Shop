package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.WishlistItem;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.WishlistService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/users/{userId}/wishlist")
    public ResponseEntity<List<WishlistItem>> getWishlist(@PathVariable("userId") Long userId) {
        return new ResponseEntity<>(
                wishlistService.getWishlistByUserId(userId),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @PostMapping("/users/{userId}/wishlist")
    public ResponseEntity<WishlistItem> addWishlistItem(
            @PathVariable("userId") Long userId,
            @RequestBody WishlistItem wishlistItem,
            HttpServletRequest request
    ) {
        WishlistItem created = wishlistService.addWishlistItem(userId, wishlistItem);
        if (created == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(
                created,
                headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/users/{userId}/wishlist/{wishlistItemId}")
    public ResponseEntity<Void> deleteWishlistItem(
            @PathVariable("userId") Long userId,
            @PathVariable("wishlistItemId") Long wishlistItemId
    ) {
        wishlistService.deleteWishlistItem(userId, wishlistItemId);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
