package com.rainbowforest.productcatalogservice.dto;

import com.rainbowforest.productcatalogservice.entity.ContactStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String message;
    private ContactStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
