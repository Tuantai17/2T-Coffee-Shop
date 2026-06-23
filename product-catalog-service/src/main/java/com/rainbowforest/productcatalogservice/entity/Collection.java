package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "collections")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "subtitle", length = 1000)
    private String subtitle;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "banner_url", length = 2000)
    private String bannerUrl;

    @Column(name = "target_url")
    private String targetUrl;

    @Column(name = "category_filter")
    private String categoryFilter;

    @Column(name = "brand_filter")
    private String brandFilter;

    @Column(name = "badge_filter")
    private String badgeFilter;

    @Column(name = "active")
    private boolean active;

    @Column(name = "featured")
    private boolean featured;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public String getCategoryFilter() {
        return categoryFilter;
    }

    public void setCategoryFilter(String categoryFilter) {
        this.categoryFilter = categoryFilter;
    }

    public String getBrandFilter() {
        return brandFilter;
    }

    public void setBrandFilter(String brandFilter) {
        this.brandFilter = brandFilter;
    }

    public String getBadgeFilter() {
        return badgeFilter;
    }

    public void setBadgeFilter(String badgeFilter) {
        this.badgeFilter = badgeFilter;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
