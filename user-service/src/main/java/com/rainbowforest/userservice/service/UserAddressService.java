package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.UserAddress;

import java.util.List;

public interface UserAddressService {
    List<UserAddress> getAddressesByUserId(Long userId);
    UserAddress addAddress(Long userId, UserAddress address);
    UserAddress updateAddress(Long userId, Long addressId, UserAddress address);
    void deleteAddress(Long userId, Long addressId);
}
