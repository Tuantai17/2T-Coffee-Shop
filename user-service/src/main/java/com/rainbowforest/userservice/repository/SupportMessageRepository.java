package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.SupportMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    Page<SupportMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    @Modifying
    @Query("UPDATE SupportMessage m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.senderRole = :senderRole")
    void markMessagesAsRead(@Param("conversationId") Long conversationId, @Param("senderRole") String senderRole);

    @Query("SELECT COUNT(m) FROM SupportMessage m WHERE m.createdAt >= :startDate AND m.createdAt < :endDate")
    long countMessagesInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
