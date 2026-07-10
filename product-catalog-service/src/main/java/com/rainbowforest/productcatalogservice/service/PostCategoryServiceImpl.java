package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.PostCategoryDto;
import com.rainbowforest.productcatalogservice.entity.PostCategory;
import com.rainbowforest.productcatalogservice.mapper.PostCategoryMapper;
import com.rainbowforest.productcatalogservice.repository.PostCategoryRepository;
import com.rainbowforest.productcatalogservice.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostCategoryServiceImpl implements PostCategoryService {

    @Autowired
    private PostCategoryRepository categoryRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostCategoryMapper mapper;

    @Override
    public Page<PostCategoryDto> getCategories(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return categoryRepository.findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(keyword, keyword, pageable)
                    .map(mapper::toDto);
        }
        return categoryRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    public PostCategoryDto getCategoryById(Long id) {
        PostCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapper.toDto(category);
    }

    @Override
    @Transactional
    public PostCategoryDto createCategory(PostCategoryDto dto) {
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }
        PostCategory entity = mapper.toEntity(dto);
        return mapper.toDto(categoryRepository.save(entity));
    }

    @Override
    @Transactional
    public PostCategoryDto updateCategory(Long id, PostCategoryDto dto) {
        PostCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getSlug().equals(dto.getSlug()) && categoryRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }

        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        if (dto.getDisplayOrder() != null) category.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getStatus() != null) category.setStatus(dto.getStatus());

        return mapper.toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        PostCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (postRepository.existsByCategoryIdAndIsDeletedFalse(id)) {
            // Should be handled in controller to return HTTP 409
            throw new IllegalStateException("Không thể xóa chuyên mục vì vẫn còn bài viết đang sử dụng. Hãy chuyển các bài viết sang chuyên mục khác trước khi xóa.");
        }
        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public PostCategoryDto updateStatus(Long id, Boolean status) {
        PostCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setStatus(status);
        return mapper.toDto(categoryRepository.save(category));
    }
}
