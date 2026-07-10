package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Post;
import com.rainbowforest.productcatalogservice.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    Optional<Post> findBySlugAndIsDeletedFalse(String slug);
    Optional<Post> findByIdAndIsDeletedFalse(Long id);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySlug(String slug);
    boolean existsByCategoryIdAndIsDeletedFalse(Long categoryId);
    
    // For public UI:
    Page<Post> findByStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
            PostStatus status, java.time.LocalDateTime now, Pageable pageable);
    
    List<Post> findTop5ByStatusAndIsDeletedFalseAndIsFeaturedTrueAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
            PostStatus status, java.time.LocalDateTime now);
            
    List<Post> findTop5ByStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
            PostStatus status, java.time.LocalDateTime now);
            
    List<Post> findTop4ByCategoryIdAndIdNotAndStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
            Long categoryId, Long id, PostStatus status, java.time.LocalDateTime now);
}
