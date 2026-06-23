package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserAddressService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserAddressController {

    @Autowired
    private UserAddressService userAddressService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/users/{userId}/addresses")
    public ResponseEntity<List<UserAddress>> getAddresses(@PathVariable("userId") Long userId) {
        return new ResponseEntity<>(
                userAddressService.getAddressesByUserId(userId),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @PostMapping("/users/{userId}/addresses")
    public ResponseEntity<UserAddress> addAddress(
            @PathVariable("userId") Long userId,
            @RequestBody UserAddress address,
            HttpServletRequest request
    ) {
        UserAddress created = userAddressService.addAddress(userId, address);
        if (created == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(
                created,
                headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/users/{userId}/addresses/{addressId}")
    public ResponseEntity<UserAddress> updateAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @RequestBody UserAddress address
    ) {
        UserAddress updated = userAddressService.updateAddress(userId, addressId, address);
        if (updated == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updated, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @DeleteMapping("/users/{userId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId
    ) {
        userAddressService.deleteAddress(userId, addressId);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
