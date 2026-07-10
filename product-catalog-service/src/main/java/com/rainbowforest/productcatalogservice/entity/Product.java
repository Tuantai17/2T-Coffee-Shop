package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table (name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "product_name")
    @NotNull
    private String productName;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "sku")
    private String sku;

    @Column(name = "brand")
    private String brand;

    @Column (name = "price")
    @NotNull
    private BigDecimal price;

    @Column (name = "original_price")
    private BigDecimal originalPrice;

    @Column (name = "discription", length = 5000)
    private String discription;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column (name = "category")
    @NotNull
    private String category;

    @Column (name = "availability")
    @NotNull
    private int availability;

    @Column (name = "image_url")
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @OrderColumn(name = "sort_order")
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "status")
    private String status;

    @Column(name = "badge")
    private String badge;

    @Column(name = "tags")
    private String tags;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Variant> variants = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "product_option_groups",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private List<OptionGroup> optionGroups = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "product_toppings",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "topping_id")
    )
    private List<Topping> toppings = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false, columnDefinition = "boolean default false")
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "delete_reason")
    private String deleteReason;

    @Column(name = "on_sale")
    private Boolean onSale = false;

    @Column(name = "new_arrival")
    private Boolean newArrival = false;

    @Column(name = "featured")
    private Boolean featured = false;

    @Column(name = "on_sale_order")
    private Integer onSaleOrder;

    @Column(name = "new_arrival_order")
    private Integer newArrivalOrder;

    @Column(name = "featured_order")
    private Integer featuredOrder;

    @Column(name = "age_min")
    private Integer ageMin;

    @Column(name = "age_max")
    private Integer ageMax;

	public Product() {

	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public BigDecimal getOriginalPrice() {
		return originalPrice;
	}

	public void setOriginalPrice(BigDecimal originalPrice) {
		this.originalPrice = originalPrice;
	}

	public String getDiscription() {
		return discription;
	}

	public void setDiscription(String discription) {
		this.discription = discription;
	}

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public int getAvailability() {
		return availability;
	}

	public void setAvailability(int availability) {
		this.availability = availability;
	}

	public String getImageUrl() {
		if ((imageUrl == null || imageUrl.isBlank()) && imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls.get(0);
        }
        return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls == null ? new ArrayList<>() : imageUrls;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public List<Variant> getVariants() {
        return variants;
    }

    public void setVariants(List<Variant> variants) {
        this.variants = variants;
    }

    public List<OptionGroup> getOptionGroups() {
        return optionGroups;
    }

    public void setOptionGroups(List<OptionGroup> optionGroups) {
        this.optionGroups = optionGroups;
    }

    public List<Topping> getToppings() {
        return toppings;
    }

    public void setToppings(List<Topping> toppings) {
        this.toppings = toppings;
    }

	@JsonProperty("name")
	public String getName() {
		return productName;
	}

	@JsonProperty("name")
	public void setName(String name) {
		this.productName = name;
	}

	@JsonProperty("description")
	public String getDescription() {
		return discription;
	}

	@JsonProperty("description")
	public void setDescription(String description) {
		this.discription = description;
	}


	@JsonProperty("quantity")
	public int getQuantity() {
		return availability;
	}

	@JsonProperty("quantity")
	public void setQuantity(int quantity) {
		this.availability = quantity;
	}

	@JsonProperty("categoryId")
	public String getCategoryId() {
		return category;
	}

	@JsonProperty("categoryId")
	public void setCategoryId(String categoryId) {
		this.category = categoryId;
	}

    public boolean isDeleted() {
        return Boolean.TRUE.equals(isDeleted);
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted != null ? deleted : false;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(String deletedBy) {
        this.deletedBy = deletedBy;
    }

    public String getDeleteReason() {
        return deleteReason;
    }

    public void setDeleteReason(String deleteReason) {
        this.deleteReason = deleteReason;
    }

    public boolean isOnSale() { return Boolean.TRUE.equals(onSale); }
    public void setOnSale(Boolean onSale) { this.onSale = onSale != null ? onSale : false; }

    public boolean isNewArrival() { return Boolean.TRUE.equals(newArrival); }
    public void setNewArrival(Boolean newArrival) { this.newArrival = newArrival != null ? newArrival : false; }

    public boolean isFeatured() { return Boolean.TRUE.equals(featured); }
    public void setFeatured(Boolean featured) { this.featured = featured != null ? featured : false; }

    public Integer getOnSaleOrder() { return onSaleOrder; }
    public void setOnSaleOrder(Integer onSaleOrder) { this.onSaleOrder = onSaleOrder; }

    public Integer getNewArrivalOrder() { return newArrivalOrder; }
    public void setNewArrivalOrder(Integer newArrivalOrder) { this.newArrivalOrder = newArrivalOrder; }

    public Integer getFeaturedOrder() { return featuredOrder; }
    public void setFeaturedOrder(Integer featuredOrder) { this.featuredOrder = featuredOrder; }

    public Integer getAgeMin() { return ageMin; }
    public void setAgeMin(Integer ageMin) { this.ageMin = ageMin; }

    public Integer getAgeMax() { return ageMax; }
    public void setAgeMax(Integer ageMax) { this.ageMax = ageMax; }
}
