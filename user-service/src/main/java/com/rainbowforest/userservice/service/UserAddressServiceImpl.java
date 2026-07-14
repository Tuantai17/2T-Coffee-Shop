package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.repository.UserAddressRepository;
import com.rainbowforest.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserAddressServiceImpl implements UserAddressService {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<UserAddress> getAddressesByUserId(Long userId) {
        return userAddressRepository.findByUserIdOrderByIdAsc(userId);
    }

    @Override
    public UserAddress addAddress(Long userId, UserAddress address) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        if (address.isDefault()) {
            clearDefaultAddress(userId);
        }
        address.setUser(user);
        return userAddressRepository.save(address);
    }

    @Override
    public UserAddress updateAddress(Long userId, Long addressId, UserAddress addressDetails) {
        UserAddress address = userAddressRepository.findById(addressId).orElse(null);
        if (address == null || address.getUser() == null || !address.getUser().getId().equals(userId)) {
            return null;
        }
        if (addressDetails.isDefault()) {
            clearDefaultAddress(userId);
        }
        address.setLabel(addressDetails.getLabel());
        address.setReceiverName(addressDetails.getReceiverName());
        address.setPhoneNumber(addressDetails.getPhoneNumber());
        address.setAddressLine(addressDetails.getAddressLine());
        address.setWard(addressDetails.getWard());
        address.setWardCode(addressDetails.getWardCode());
        address.setDistrict(addressDetails.getDistrict());
        address.setProvince(addressDetails.getProvince());
        address.setProvinceCode(addressDetails.getProvinceCode());
        address.setDefault(addressDetails.isDefault());
        return userAddressRepository.save(address);
    }

    @Override
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId).orElse(null);
        if (address != null && address.getUser() != null && address.getUser().getId().equals(userId)) {
            userAddressRepository.delete(address);
        }
    }

    private void clearDefaultAddress(Long userId) {
        List<UserAddress> addresses = userAddressRepository.findByUserIdOrderByIdAsc(userId);
        for (UserAddress item : addresses) {
            if (item.isDefault()) {
                item.setDefault(false);
                userAddressRepository.save(item);
            }
        }
    }
}
