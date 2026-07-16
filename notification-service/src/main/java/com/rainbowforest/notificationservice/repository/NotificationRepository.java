package com.rainbowforest.notificationservice.repository;

import com.rainbowforest.notificationservice.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(String recipientId, String recipientRole, Pageable pageable);
    
    Page<Notification> findByRecipientIdAndRecipientRoleAndCategoryOrderByCreatedAtDesc(String recipientId, String recipientRole, String category, Pageable pageable);
    
    Page<Notification> findByRecipientIdAndRecipientRoleAndIsReadOrderByCreatedAtDesc(String recipientId, String recipientRole, boolean isRead, Pageable pageable);

    Page<Notification> findByRecipientIdAndRecipientRoleAndCategoryAndIsReadOrderByCreatedAtDesc(String recipientId, String recipientRole, String category, boolean isRead, Pageable pageable);

    Long countByRecipientIdAndRecipientRoleAndIsReadFalse(String recipientId, String recipientRole);

    List<Notification> findByRecipientIdAndRecipientRoleAndIsReadFalse(String recipientId, String recipientRole);
    
    boolean existsByEventIdAndRecipientId(String eventId, String recipientId);
    boolean existsByIdempotencyKeyAndRecipientId(String idempotencyKey, String recipientId);
}
