package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.ContactMessageRequest;
import com.rainbowforest.productcatalogservice.dto.ContactMessageResponse;
import com.rainbowforest.productcatalogservice.dto.StoreContactDto;
import com.rainbowforest.productcatalogservice.entity.ContactMessage;
import com.rainbowforest.productcatalogservice.entity.ContactStatus;
import com.rainbowforest.productcatalogservice.entity.StoreContactInformation;
import com.rainbowforest.productcatalogservice.repository.ContactMessageRepository;
import com.rainbowforest.productcatalogservice.repository.StoreContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final StoreContactRepository storeContactRepository;
    private final ContactMessageRepository contactMessageRepository;

    // --- STORE CONTACT INFORMATION ---

    public StoreContactDto getStoreContact() {
        List<StoreContactInformation> list = storeContactRepository.findAll();
        if (list.isEmpty()) {
            return StoreContactDto.builder()
                    .id(null)
                    .phone("")
                    .address("")
                    .googleMapsUrl("")
                    .build();
        }
        StoreContactInformation info = list.get(0);
        return StoreContactDto.builder()
                .id(info.getId())
                .phone(info.getPhone())
                .address(info.getAddress())
                .googleMapsUrl(info.getGoogleMapsUrl())
                .build();
    }

    @Transactional
    public StoreContactDto updateStoreContact(StoreContactDto dto) {
        List<StoreContactInformation> list = storeContactRepository.findAll();
        StoreContactInformation info;
        if (list.isEmpty()) {
            info = new StoreContactInformation();
        } else {
            info = list.get(0);
        }

        info.setPhone(dto.getPhone());
        info.setAddress(dto.getAddress());
        info.setGoogleMapsUrl(dto.getGoogleMapsUrl());

        StoreContactInformation saved = storeContactRepository.save(info);

        return StoreContactDto.builder()
                .id(saved.getId())
                .phone(saved.getPhone())
                .address(saved.getAddress())
                .googleMapsUrl(saved.getGoogleMapsUrl())
                .build();
    }

    // --- CONTACT MESSAGES ---

    @Transactional
    public ContactMessageResponse createContactMessage(ContactMessageRequest request) {
        ContactMessage message = ContactMessage.builder()
                .fullName(HtmlUtils.htmlEscape(request.getFullName()))
                .email(HtmlUtils.htmlEscape(request.getEmail()))
                .phone(HtmlUtils.htmlEscape(request.getPhone()))
                .message(HtmlUtils.htmlEscape(request.getMessage()))
                .status(ContactStatus.NEW)
                .build();

        ContactMessage saved = contactMessageRepository.save(message);
        return mapToResponse(saved);
    }

    public Page<ContactMessageResponse> getContactMessages(String keyword, ContactStatus status, Pageable pageable) {
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }

        Page<ContactMessage> messages;
        if (keyword == null && status == null) {
            messages = contactMessageRepository.findAll(pageable);
        } else if (keyword == null) {
            messages = contactMessageRepository.findByStatus(status, pageable);
        } else if (status == null) {
            messages = contactMessageRepository.findByKeyword(keyword, pageable);
        } else {
            messages = contactMessageRepository.findByKeywordAndStatus(keyword, status, pageable);
        }
        return messages.map(this::mapToResponse);
    }

    public ContactMessageResponse getContactMessageById(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        return mapToResponse(message);
    }

    @Transactional
    public ContactMessageResponse updateContactMessageStatus(Long id, ContactStatus newStatus) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        message.setStatus(newStatus);
        ContactMessage saved = contactMessageRepository.save(message);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteContactMessage(Long id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new RuntimeException("Contact message not found");
        }
        contactMessageRepository.deleteById(id);
    }

    private ContactMessageResponse mapToResponse(ContactMessage message) {
        return ContactMessageResponse.builder()
                .id(message.getId())
                .fullName(message.getFullName())
                .email(message.getEmail())
                .phone(message.getPhone())
                .message(message.getMessage())
                .status(message.getStatus())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
}
