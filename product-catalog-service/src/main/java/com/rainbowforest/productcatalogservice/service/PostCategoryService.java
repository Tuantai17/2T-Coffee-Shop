package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.PostCategoryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostCategoryService {
    Page<PostCategoryDto> getCategories(String keyword, Pageable pageable);
    PostCategoryDto getCategoryById(Long id);
    PostCategoryDto createCategory(PostCategoryDto dto);
    PostCategoryDto updateCategory(Long id, PostCategoryDto dto);
    void deleteCategory(Long id);
    PostCategoryDto updateStatus(Long id, Boolean status);
}
