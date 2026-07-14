package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.UserAddressRequestDTO;
import com.rainbowforest.userservice.dto.UserAddressResponseDTO;
import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserAddressService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    public ResponseEntity<List<UserAddressResponseDTO>> getAddresses(@PathVariable("userId") Long userId) {
        List<UserAddress> addresses = userAddressService.getAddressesByUserId(userId);
        List<UserAddressResponseDTO> dtos = addresses.stream()
                .map(this::mapToResponseDTO)
                .toList();
        return new ResponseEntity<>(dtos, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping("/users/{userId}/addresses/default")
    public ResponseEntity<UserAddressResponseDTO> getDefaultAddress(@PathVariable("userId") Long userId) {
        List<UserAddress> addresses = userAddressService.getAddressesByUserId(userId);
        UserAddress defaultAddress = addresses.stream()
                .filter(UserAddress::isDefault)
                .findFirst()
                .orElse(null);
        if (defaultAddress != null) {
            return new ResponseEntity<>(mapToResponseDTO(defaultAddress), headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.NO_CONTENT);
    }

    @PostMapping("/users/{userId}/addresses")
    public ResponseEntity<UserAddressResponseDTO> addAddress(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UserAddressRequestDTO requestDTO,
            HttpServletRequest request
    ) {
        UserAddress address = mapToEntity(requestDTO);
        UserAddress created = userAddressService.addAddress(userId, address);
        if (created == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(
                mapToResponseDTO(created),
                headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/users/{userId}/addresses/{addressId}")
    public ResponseEntity<UserAddressResponseDTO> updateAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @Valid @RequestBody UserAddressRequestDTO requestDTO
    ) {
        UserAddress address = mapToEntity(requestDTO);
        UserAddress updated = userAddressService.updateAddress(userId, addressId, address);
        if (updated == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(mapToResponseDTO(updated), headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @DeleteMapping("/users/{userId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId
    ) {
        userAddressService.deleteAddress(userId, addressId);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    private UserAddress mapToEntity(UserAddressRequestDTO dto) {
        UserAddress entity = new UserAddress();
        entity.setLabel(dto.getAddressType());
        entity.setReceiverName(dto.getRecipientName());
        entity.setPhoneNumber(dto.getPhone());
        entity.setProvinceCode(dto.getProvinceCode());
        entity.setProvince(dto.getProvinceName());
        entity.setWardCode(dto.getWardCode());
        entity.setWard(dto.getWardName());
        entity.setDistrict(dto.getDistrictName());
        entity.setAddressLine(dto.getDetailAddress());
        entity.setDefault(dto.getIsDefault());
        return entity;
    }

    private UserAddressResponseDTO mapToResponseDTO(UserAddress entity) {
        UserAddressResponseDTO dto = new UserAddressResponseDTO();
        dto.setId(entity.getId());
        dto.setAddressType(entity.getLabel());
        dto.setRecipientName(entity.getReceiverName());
        dto.setPhone(entity.getPhoneNumber());
        dto.setProvinceCode(entity.getProvinceCode());
        dto.setProvinceName(entity.getProvince());
        dto.setWardCode(entity.getWardCode());
        dto.setWardName(entity.getWard());
        dto.setDetailAddress(entity.getAddressLine());
        dto.setDistrictName(entity.getDistrict()); // Backward compatibility
        dto.setIsDefault(entity.isDefault());
        dto.setFullAddress(buildFullAddress(entity));
        return dto;
    }

    private String buildFullAddress(UserAddress entity) {
        String[] parts = {
                entity.getAddressLine(),
                entity.getWard(),
                entity.getDistrict(),
                entity.getProvince()
        };

        StringBuilder fullAddress = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            if (!fullAddress.isEmpty()) {
                fullAddress.append(", ");
            }
            fullAddress.append(part.trim());
        }
        return fullAddress.toString();
    }
}
