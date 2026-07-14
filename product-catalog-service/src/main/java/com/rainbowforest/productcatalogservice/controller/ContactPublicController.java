package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ContactMessageRequest;
import com.rainbowforest.productcatalogservice.dto.ContactMessageResponse;
import com.rainbowforest.productcatalogservice.dto.StoreContactDto;
import com.rainbowforest.productcatalogservice.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class ContactPublicController {

    private final ContactService contactService;

    @GetMapping("store-contact")
    public ResponseEntity<StoreContactDto> getStoreContact() {
        StoreContactDto dto = contactService.getStoreContact();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("contacts")
    public ResponseEntity<ContactMessageResponse> createContactMessage(@Valid @RequestBody ContactMessageRequest request) {
        return ResponseEntity.ok(contactService.createContactMessage(request));
    }
}
