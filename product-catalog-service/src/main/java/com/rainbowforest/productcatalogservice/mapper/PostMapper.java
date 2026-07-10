package com.rainbowforest.productcatalogservice.mapper;

import com.rainbowforest.productcatalogservice.dto.PostDto;
import com.rainbowforest.productcatalogservice.entity.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public PostDto toDto(Post entity) {
        if (entity == null) return null;
        PostDto dto = new PostDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setSummary(entity.getSummary());
        dto.setContentHtml(entity.getContentHtml());
        dto.setThumbnailUrl(entity.getThumbnailUrl());
        
        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }
        
        dto.setAuthorId(entity.getAuthorId());
        dto.setAuthorName(entity.getAuthorName());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setIsFeatured(entity.getIsFeatured());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setViewCount(entity.getViewCount());
        dto.setMetaTitle(entity.getMetaTitle());
        dto.setMetaDescription(entity.getMetaDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
