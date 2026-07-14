package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ContactMessageResponse;
import com.rainbowforest.productcatalogservice.dto.ContactStatusUpdateDto;
import com.rainbowforest.productcatalogservice.dto.StoreContactDto;
import com.rainbowforest.productcatalogservice.entity.ContactStatus;
import com.rainbowforest.productcatalogservice.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class ContactAdminController {

    private final ContactService contactService;

    @GetMapping("/store-contact")
    public ResponseEntity<StoreContactDto> getStoreContact() {
        StoreContactDto dto = contactService.getStoreContact();
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/store-contact")
    public ResponseEntity<StoreContactDto> updateStoreContact(@RequestBody StoreContactDto dto) {
        return ResponseEntity.ok(contactService.updateStoreContact(dto));
    }

    @GetMapping("/contacts")
    public ResponseEntity<Page<ContactMessageResponse>> getContactMessages(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ContactStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        
        return ResponseEntity.ok(contactService.getContactMessages(keyword, status, pageable));
    }

    @GetMapping("/contacts/{id}")
    public ResponseEntity<ContactMessageResponse> getContactMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactMessageById(id));
    }

    @PutMapping("/contacts/{id}/status")
    public ResponseEntity<ContactMessageResponse> updateContactMessageStatus(
            @PathVariable Long id, 
            @Valid @RequestBody ContactStatusUpdateDto dto) {
        return ResponseEntity.ok(contactService.updateContactMessageStatus(id, dto.getStatus()));
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<Void> deleteContactMessage(@PathVariable Long id) {
        contactService.deleteContactMessage(id);
        return ResponseEntity.noContent().build();
    }
}
