package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.ContactMessage;
import com.rainbowforest.productcatalogservice.entity.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    @Query("SELECT c FROM ContactMessage c WHERE " +
           "(LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ContactMessage> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<ContactMessage> findByStatus(ContactStatus status, Pageable pageable);

    @Query("SELECT c FROM ContactMessage c WHERE " +
           "(LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "c.status = :status")
    Page<ContactMessage> findByKeywordAndStatus(
            @Param("keyword") String keyword, 
            @Param("status") ContactStatus status, 
            Pageable pageable);
}
