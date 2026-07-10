package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.PostDto;
import com.rainbowforest.productcatalogservice.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/posts")
public class PublicPostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<Page<PostDto>> getPublicPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        return ResponseEntity.ok(postService.getPublicPosts(pageable));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<PostDto>> getFeaturedPosts() {
        return ResponseEntity.ok(postService.getFeaturedPosts());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PostDto> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPublicPostBySlug(slug));
    }

    @GetMapping("/{slug}/related")
    public ResponseEntity<List<PostDto>> getRelatedPosts(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getRelatedPosts(slug));
    }

    @PostMapping("/{slug}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable String slug) {
        postService.incrementViewCount(slug);
        return ResponseEntity.ok().build();
    }
}
