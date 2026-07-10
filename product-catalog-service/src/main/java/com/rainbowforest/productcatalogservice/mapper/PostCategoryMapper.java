package com.rainbowforest.productcatalogservice.mapper;

import com.rainbowforest.productcatalogservice.dto.PostCategoryDto;
import com.rainbowforest.productcatalogservice.entity.PostCategory;
import org.springframework.stereotype.Component;

@Component
public class PostCategoryMapper {

    public PostCategoryDto toDto(PostCategory entity) {
        if (entity == null) return null;
        PostCategoryDto dto = new PostCategoryDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSlug(entity.getSlug());
        dto.setDescription(entity.getDescription());
        dto.setPostCount(entity.getPostCount());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public PostCategory toEntity(PostCategoryDto dto) {
        if (dto == null) return null;
        PostCategory entity = new PostCategory();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setSlug(dto.getSlug());
        entity.setDescription(dto.getDescription());
        if (dto.getPostCount() != null) entity.setPostCount(dto.getPostCount());
        if (dto.getDisplayOrder() != null) entity.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return entity;
    }
}
