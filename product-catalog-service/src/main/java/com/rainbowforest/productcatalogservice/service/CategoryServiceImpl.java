package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category addCategory(Category category) {
        prepareCategory(category);
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category != null) {
            if (category.getImageUrl() != null && categoryDetails.getImageUrl() != null 
                    && !category.getImageUrl().equals(categoryDetails.getImageUrl())) {
                fileUploadService.deleteImage(category.getImageUrl());
            }
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            category.setSlug(categoryDetails.getSlug());
            category.setImageUrl(categoryDetails.getImageUrl());
            category.setParentId(categoryDetails.getParentId());
            category.setSortOrder(categoryDetails.getSortOrder());
            prepareCategory(category);
            return categoryRepository.save(category);
        }
        return null;
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        if (category != null && category.getImageUrl() != null) {
            fileUploadService.deleteImage(category.getImageUrl());
        }
        categoryRepository.deleteById(id);
    }

    private void prepareCategory(Category category) {
        if (category == null) {
            return;
        }

        String baseSlug;
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            baseSlug = slugify(category.getName());
        } else {
            baseSlug = slugify(category.getSlug());
        }
        
        category.setSlug(generateUniqueSlug(baseSlug, category.getId()));

        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
    }

    private String generateUniqueSlug(String baseSlug, Long id) {
        String slug = baseSlug;
        int count = 1;
        while (true) {
            boolean exists = (id == null) 
                    ? categoryRepository.existsBySlug(slug)
                    : categoryRepository.existsBySlugAndIdNot(slug, id);
            
            if (!exists) {
                return slug;
            }
            slug = baseSlug + "-" + count;
            count++;
        }
    }

    private String slugify(String value) {
        if (value == null) {
            return null;
        }

        String slug = value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? null : slug;
    }
}
