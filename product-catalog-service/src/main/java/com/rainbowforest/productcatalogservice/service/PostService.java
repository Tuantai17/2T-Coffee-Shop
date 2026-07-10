package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.PostDto;
import com.rainbowforest.productcatalogservice.dto.PostRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    // Admin methods
    Page<PostDto> getAllPosts(String keyword, Long categoryId, String status, Boolean isFeatured, Pageable pageable);
    PostDto getPostById(Long id);
    PostDto createPost(PostRequestDto dto);
    PostDto updatePost(Long id, PostRequestDto dto);
    void publishPost(Long id);
    void unpublishPost(Long id);
    void toggleFeatured(Long id, boolean isFeatured);
    void softDeletePost(Long id);

    // Public methods
    Page<PostDto> getPublicPosts(Pageable pageable);
    List<PostDto> getFeaturedPosts();
    PostDto getPublicPostBySlug(String slug);
    List<PostDto> getRelatedPosts(String slug);
    void incrementViewCount(String slug);
}
