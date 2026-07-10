package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.PostCategoryDto;
import com.rainbowforest.productcatalogservice.service.PostCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/post-categories")
public class AdminPostCategoryController {

    @Autowired
    private PostCategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<PostCategoryDto>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(categoryService.getCategories(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostCategoryDto> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<PostCategoryDto> createCategory(@RequestBody PostCategoryDto dto) {
        return ResponseEntity.ok(categoryService.createCategory(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostCategoryDto> updateCategory(@PathVariable Long id, @RequestBody PostCategoryDto dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PostCategoryDto> updateStatus(@PathVariable Long id, @RequestParam boolean status) {
        return ResponseEntity.ok(categoryService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
