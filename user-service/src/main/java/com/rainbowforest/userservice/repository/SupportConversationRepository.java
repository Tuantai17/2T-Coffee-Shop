package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.SupportConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {

    Optional<SupportConversation> findByCustomerIdAndStatus(Long customerId, String status);

    @Query("SELECT c FROM SupportConversation c WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "EXISTS (SELECT u FROM User u WHERE u.id = c.customerId AND " +
           "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "ORDER BY c.lastMessageAt DESC")
    Page<SupportConversation> findAllWithFilters(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM SupportConversation c WHERE c.adminUnreadCount > 0")
    long countUnreadConversations();
    
    @Query("SELECT COUNT(c) FROM SupportConversation c")
    long countTotalConversations();
}
