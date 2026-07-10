package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.PostDto;
import com.rainbowforest.productcatalogservice.dto.PostRequestDto;
import com.rainbowforest.productcatalogservice.entity.Post;
import com.rainbowforest.productcatalogservice.entity.PostCategory;
import com.rainbowforest.productcatalogservice.entity.PostStatus;
import com.rainbowforest.productcatalogservice.mapper.PostMapper;
import com.rainbowforest.productcatalogservice.repository.PostCategoryRepository;
import com.rainbowforest.productcatalogservice.repository.PostRepository;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostCategoryRepository categoryRepository;

    @Autowired
    private PostMapper mapper;

    // A robust sanitizer policy that allows common rich text formatting, links, images, tables, etc.
    private static final PolicyFactory SANITIZER_POLICY = Sanitizers.FORMATTING
            .and(Sanitizers.LINKS)
            .and(Sanitizers.BLOCKS)
            .and(Sanitizers.IMAGES)
            .and(Sanitizers.STYLES)
            .and(Sanitizers.TABLES)
            .and(new HtmlPolicyBuilder()
                    .allowElements("figure", "figcaption", "hr", "s", "u", "iframe")
                    .allowAttributes("class").onElements("figure", "figcaption", "table", "td", "tr", "th", "img", "p", "div", "span", "ul", "ol", "li", "a")
                    .allowAttributes("src", "width", "height", "frameborder", "allow", "allowfullscreen").onElements("iframe")
                    .toFactory());

    private String sanitizeHtml(String html) {
        if (html == null) return null;
        return SANITIZER_POLICY.sanitize(html);
    }

    @Override
    public Page<PostDto> getAllPosts(String keyword, Long categoryId, String status, Boolean isFeatured, Pageable pageable) {
        Specification<Post> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (keyword != null && !keyword.isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern),
                        cb.like(cb.lower(root.get("authorName")), pattern)
                ));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), PostStatus.valueOf(status)));
            }
            if (isFeatured != null) {
                predicates.add(cb.equal(root.get("isFeatured"), isFeatured));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return postRepository.findAll(spec, pageable).map(mapper::toDto);
    }

    @Override
    public PostDto getPostById(Long id) {
        Post post = postRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapper.toDto(post);
    }

    @Override
    @Transactional
    public PostDto createPost(PostRequestDto dto) {
        if (postRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("POST_SLUG_ALREADY_EXISTS");
        }

        PostCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setSummary(dto.getSummary());
        post.setContentHtml(sanitizeHtml(dto.getContentHtml()));
        post.setThumbnailUrl(dto.getThumbnailUrl());
        post.setCategory(category);
        post.setStatus(PostStatus.valueOf(dto.getStatus()));
        post.setIsFeatured(dto.getIsFeatured());
        post.setPublishedAt(dto.getPublishedAt());
        post.setMetaTitle(dto.getMetaTitle());
        post.setMetaDescription(dto.getMetaDescription());
        
        // TODO: Get actual author from SecurityContext
        post.setAuthorId("ADMIN");
        post.setAuthorName("Administrator");

        Post savedPost = postRepository.save(post);
        
        category.setPostCount(category.getPostCount() + 1);
        categoryRepository.save(category);

        return mapper.toDto(savedPost);
    }

    @Override
    @Transactional
    public PostDto updatePost(Long id, PostRequestDto dto) {
        Post post = postRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getSlug().equals(dto.getSlug()) && postRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("POST_SLUG_ALREADY_EXISTS");
        }

        PostCategory oldCategory = post.getCategory();
        PostCategory newCategory = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setSummary(dto.getSummary());
        post.setContentHtml(sanitizeHtml(dto.getContentHtml()));
        post.setThumbnailUrl(dto.getThumbnailUrl());
        post.setCategory(newCategory);
        post.setStatus(PostStatus.valueOf(dto.getStatus()));
        post.setIsFeatured(dto.getIsFeatured());
        post.setPublishedAt(dto.getPublishedAt());
        post.setMetaTitle(dto.getMetaTitle());
        post.setMetaDescription(dto.getMetaDescription());

        Post savedPost = postRepository.save(post);

        if (!oldCategory.getId().equals(newCategory.getId())) {
            oldCategory.setPostCount(Math.max(0, oldCategory.getPostCount() - 1));
            newCategory.setPostCount(newCategory.getPostCount() + 1);
            categoryRepository.save(oldCategory);
            categoryRepository.save(newCategory);
        }

        return mapper.toDto(savedPost);
    }

    @Override
    @Transactional
    public void publishPost(Long id) {
        Post post = postRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus(PostStatus.PUBLISHED);
        if (post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void unpublishPost(Long id) {
        Post post = postRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus(PostStatus.HIDDEN);
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void toggleFeatured(Long id, boolean isFeatured) {
        Post post = postRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setIsFeatured(isFeatured);
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void softDeletePost(Long id) {
        Post post = postRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setIsDeleted(true);
        post.setDeletedAt(LocalDateTime.now());
        // TODO: Get actual user
        post.setDeletedBy("ADMIN");
        postRepository.save(post);

        PostCategory category = post.getCategory();
        if (category != null) {
            category.setPostCount(Math.max(0, category.getPostCount() - 1));
            categoryRepository.save(category);
        }
    }

    @Override
    public Page<PostDto> getPublicPosts(Pageable pageable) {
        return postRepository.findByStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
                PostStatus.PUBLISHED, LocalDateTime.now(), pageable).map(mapper::toDto);
    }

    @Override
    public List<PostDto> getFeaturedPosts() {
        List<Post> featured = postRepository.findTop5ByStatusAndIsDeletedFalseAndIsFeaturedTrueAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
                PostStatus.PUBLISHED, LocalDateTime.now());
        if (featured.isEmpty()) {
            featured = postRepository.findTop5ByStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
                    PostStatus.PUBLISHED, LocalDateTime.now());
        }
        return featured.stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    public PostDto getPublicPostBySlug(String slug) {
        Post post = postRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (post.getStatus() != PostStatus.PUBLISHED || (post.getPublishedAt() != null && post.getPublishedAt().isAfter(LocalDateTime.now()))) {
            throw new RuntimeException("Post not found");
        }
        return mapper.toDto(post);
    }

    @Override
    public List<PostDto> getRelatedPosts(String slug) {
        Post post = postRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        List<Post> related = postRepository.findTop4ByCategoryIdAndIdNotAndStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
                post.getCategory().getId(), post.getId(), PostStatus.PUBLISHED, LocalDateTime.now());
                
        if (related.size() < 3) {
             // Fallback to recent posts if not enough related
             List<Post> recent = postRepository.findTop5ByStatusAndIsDeletedFalseAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
                    PostStatus.PUBLISHED, LocalDateTime.now());
             // filter out current post
             for (Post p : recent) {
                 if (!p.getId().equals(post.getId()) && related.stream().noneMatch(r -> r.getId().equals(p.getId()))) {
                     related.add(p);
                     if (related.size() >= 4) break;
                 }
             }
        }
        return related.stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementViewCount(String slug) {
        postRepository.findBySlugAndIsDeletedFalse(slug).ifPresent(post -> {
            post.setViewCount((post.getViewCount() == null ? 0 : post.getViewCount()) + 1);
            postRepository.save(post);
        });
    }
}
