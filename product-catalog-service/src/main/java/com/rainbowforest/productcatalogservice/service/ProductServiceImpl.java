package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @Override
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProduct() {
        List<Product> list = productRepository.findAll(resolveSort("newest")).stream().filter(p -> !p.isDeleted()).collect(Collectors.toList());
        list.forEach(product -> {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        });
        return list;
    }

    @Override
    @Cacheable(value = "products", key = "'category:' + #category")
    public List<Product> getAllProductByCategory(String category) {
        List<Product> list = productRepository.findAllByCategoryAndIsDeletedFalse(category);
        list.forEach(product -> {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        });
        return list;
    }

    @Override
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        }
        return product;
    }

    @Override
    @Cacheable(value = "products", key = "'slug:' + #slug")
    public Product getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsDeletedFalse(slug).orElse(null);
        if (product != null) {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        }
        return product;
    }

    @Override
    @Cacheable(value = "products", key = "'name:' + #name")
    public List<Product> getAllProductsByName(String name) {
        List<Product> products = productRepository.findAllByProductNameContainingIgnoreCaseAndIsDeletedFalse(name);
        products.forEach(product -> {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        });
        return products;
    }

    @Cacheable(value = "products")
    public List<Product> searchProducts(
            String keyword,
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer age,
            Boolean featured,
            Boolean onSale,
            Boolean newArrival,
            String badge,
            String status,
            String sort
    ) {
        String normalizedKeyword = normalize(keyword);
        String normalizedCategory = normalize(category);
        String normalizedBrand = normalize(brand);
        String normalizedBadge = normalize(badge);
        String normalizedStatus = normalize(status);

        List<Product> products = productRepository.findAll(resolveSort(sort))
                .stream()
                .filter(product -> !product.isDeleted())
                .filter(product -> matchesKeyword(product, normalizedKeyword))
                .filter(product -> matchesExact(product.getCategory(), normalizedCategory))
                .filter(product -> matchesExactIgnoreCase(product.getBrand(), normalizedBrand))
                .filter(product -> minPrice == null || product.getPrice() != null && product.getPrice().compareTo(minPrice) >= 0)
                .filter(product -> maxPrice == null || product.getPrice() != null && product.getPrice().compareTo(maxPrice) <= 0)
                .filter(product -> matchesAge(product, age))
                .filter(product -> featured == null || product.isFeatured() == featured)
                .filter(product -> onSale == null || product.isOnSale() == onSale)
                .filter(product -> newArrival == null || product.isNewArrival() == newArrival)
                .filter(product -> matchesExactIgnoreCase(product.getBadge(), normalizedBadge))
                .filter(product -> matchesExactIgnoreCase(product.getStatus(), normalizedStatus))
                .collect(Collectors.toList());

        if ("discount_desc".equalsIgnoreCase(sort)) {
            products = new ArrayList<>(products);
            products.sort(
                    Comparator.comparing(this::calculateDiscountAmount, Comparator.nullsLast(BigDecimal::compareTo))
                            .reversed()
                            .thenComparing(Product::getId, Comparator.nullsLast(Long::compareTo))
            );
        }
        
        products.forEach(product -> {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        });
        
        return products;
    }

    public Page<Product> searchProductsPaged(
            String keyword,
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer ageFrom,
            Integer ageTo,
            Boolean featured,
            Boolean onSale,
            Boolean newArrival,
            Long toppingId,
            String badge,
            String status,
            String sort,
            Pageable pageable
    ) {
        String normalizedKeyword = normalize(keyword);
        String normalizedCategory = normalize(category);
        String normalizedBrand = normalize(brand);
        String normalizedBadge = normalize(badge);
        String normalizedStatus = normalize(status);

        List<Product> products = productRepository.findAll(resolveSort(sort))
                .stream()
                .filter(product -> !product.isDeleted())
                .filter(product -> matchesKeyword(product, normalizedKeyword))
                .filter(product -> matchesExact(product.getCategory(), normalizedCategory))
                .filter(product -> matchesExactIgnoreCase(product.getBrand(), normalizedBrand))
                .filter(product -> minPrice == null || product.getPrice() != null && product.getPrice().compareTo(minPrice) >= 0)
                .filter(product -> maxPrice == null || product.getPrice() != null && product.getPrice().compareTo(maxPrice) <= 0)
                .filter(product -> matchesAgeRange(product, ageFrom, ageTo))
                .filter(product -> featured == null || product.isFeatured() == featured)
                .filter(product -> onSale == null || product.isOnSale() == onSale)
                .filter(product -> newArrival == null || product.isNewArrival() == newArrival)
                .filter(product -> matchesExactIgnoreCase(product.getBadge(), normalizedBadge))
                .filter(product -> matchesExactIgnoreCase(product.getStatus(), normalizedStatus))
                .filter(product -> matchesTopping(product, toppingId))
                .collect(Collectors.toList());

        if ("discount_desc".equalsIgnoreCase(sort)) {
            products.sort(
                    Comparator.comparing(this::calculateDiscountAmount, Comparator.nullsLast(BigDecimal::compareTo))
                            .reversed()
                            .thenComparing(Product::getId, Comparator.nullsLast(Long::compareTo))
            );
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), products.size());
        List<Product> pageContent = new ArrayList<>();
        if (start <= end) {
            pageContent = products.subList(start, end);
        }

        pageContent.forEach(product -> {
            Hibernate.initialize(product.getImageUrls());
            Hibernate.initialize(product.getVariants());
            Hibernate.initialize(product.getOptionGroups());
            if (product.getOptionGroups() != null) {
                product.getOptionGroups().forEach(og -> Hibernate.initialize(og.getOptions()));
            }
            Hibernate.initialize(product.getToppings());
        });

        return new PageImpl<>(pageContent, pageable, products.size());
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Product addProduct(Product product) {
        prepareProduct(product);
        return productRepository.save(product);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            // Delete main image if changed
            if (product.getImageUrl() != null && productDetails.getImageUrl() != null 
                    && !product.getImageUrl().equals(productDetails.getImageUrl())) {
                fileUploadService.deleteImage(product.getImageUrl());
            }

            // Delete gallery images that were removed
            if (product.getImageUrls() != null) {
                List<String> newUrls = productDetails.getImageUrls() != null ? productDetails.getImageUrls() : new ArrayList<>();
                for (String oldUrl : product.getImageUrls()) {
                    if (!newUrls.contains(oldUrl)) {
                        fileUploadService.deleteImage(oldUrl);
                    }
                }
            }

            product.setProductName(productDetails.getProductName());
            product.setPrice(productDetails.getPrice());
            product.setOriginalPrice(productDetails.getOriginalPrice());
            product.setDiscription(productDetails.getDiscription());
            product.setShortDescription(productDetails.getShortDescription());
            product.setCategory(productDetails.getCategory());
            product.setAvailability(productDetails.getAvailability());
            product.setImageUrl(productDetails.getImageUrl());
            if (product.getImageUrls() != null) {
                product.getImageUrls().clear();
                if (productDetails.getImageUrls() != null) {
                    product.getImageUrls().addAll(productDetails.getImageUrls());
                }
            } else {
                product.setImageUrls(productDetails.getImageUrls());
            }
            product.setSlug(productDetails.getSlug());
            product.setSku(productDetails.getSku());
            product.setBrand(productDetails.getBrand());
            product.setStatus(productDetails.getStatus());
            product.setBadge(productDetails.getBadge());
            product.setTags(productDetails.getTags());
            product.setAgeMin(productDetails.getAgeMin());
            product.setAgeMax(productDetails.getAgeMax());
            product.setFeatured(productDetails.isFeatured());
            product.setNewArrival(productDetails.isNewArrival());
            product.setOnSale(productDetails.isOnSale());
            product.setOnSaleOrder(productDetails.getOnSaleOrder());
            product.setNewArrivalOrder(productDetails.getNewArrivalOrder());
            product.setFeaturedOrder(productDetails.getFeaturedOrder());
            prepareProduct(product);
            return productRepository.save(product);
        }
        return null;
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long productId) {
        Product product = getProductById(productId);
        if (product != null) {
            if (product.getSku() != null && !product.getSku().trim().isEmpty()) {
                fileUploadService.deleteProductFolder(product.getSku());
            } else {
                // Fallback if sku is missing
                if (product.getImageUrl() != null) {
                    fileUploadService.deleteImage(product.getImageUrl());
                }
                if (product.getImageUrls() != null) {
                    for (String url : product.getImageUrls()) {
                        if (!url.equals(product.getImageUrl())) {
                            fileUploadService.deleteImage(url);
                        }
                    }
                }
            }
        }
        productRepository.deleteById(productId);
    }

    @Override
    public List<Product> getTrashProducts() {
        return productRepository.findAllByIsDeletedTrue();
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void softDeleteProduct(Long productId, String deletedBy, String deleteReason) {
        Product product = getProductById(productId);
        if (product != null) {
            product.setDeleted(true);
            product.setDeleteReason(deleteReason);
            product.setDeletedAt(java.time.LocalDateTime.now());
            productRepository.save(product);
        }
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void restoreProduct(Long productId) {
        Product product = getProductById(productId);
        if (product != null) {
            product.setDeleted(false);
            product.setDeleteReason(null);
            product.setDeletedAt(null);
            productRepository.save(product);
        }
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void permanentlyDeleteProduct(Long productId) {
        deleteProduct(productId);
    }

    private void prepareProduct(Product product) {
        if (product == null) {
            return;
        }

        if (product.getVariants() != null) {
            product.getVariants().forEach(v -> v.setProduct(product));
        }

        if (product.getOnSaleOrder() == null) product.setOnSaleOrder(0);
        if (product.getNewArrivalOrder() == null) product.setNewArrivalOrder(0);
        if (product.getFeaturedOrder() == null) product.setFeaturedOrder(0);

        if (product.getSlug() == null || product.getSlug().isBlank()) {
            product.setSlug(slugify(product.getProductName()));
        } else {
            product.setSlug(slugify(product.getSlug()));
        }

        if (product.getShortDescription() == null || product.getShortDescription().isBlank()) {
            product.setShortDescription(product.getDiscription());
        }

        if (product.getStatus() == null || product.getStatus().isBlank()) {
            product.setStatus(product.getAvailability() > 0 ? "ACTIVE" : "OUT_OF_STOCK");
        }

        if ((product.getImageUrl() == null || product.getImageUrl().isBlank())
                && product.getImageUrls() != null
                && !product.getImageUrls().isEmpty()) {
            product.setImageUrl(product.getImageUrls().get(0));
        }

        if ((product.getImageUrls() == null || product.getImageUrls().isEmpty())
                && product.getImageUrl() != null
                && !product.getImageUrl().isBlank()) {
            List<String> images = new ArrayList<>();
            images.add(product.getImageUrl());
            product.setImageUrls(images);
        }

        if (product.getOriginalPrice() != null && product.getPrice() != null) {
            product.setOnSale(product.getOriginalPrice().compareTo(product.getPrice()) > 0 || product.isOnSale());
        }

        if (product.getBadge() != null && !product.getBadge().isBlank()) {
            String normalizedBadge = product.getBadge().trim().toUpperCase(Locale.ROOT);
            product.setBadge(normalizedBadge);
            if ("NEW".equals(normalizedBadge)) {
                product.setNewArrival(true);
            }
            if ("SALE".equals(normalizedBadge) || normalizedBadge.contains("%")) {
                product.setOnSale(true);
            }
            if ("HOT".equals(normalizedBadge)) {
                product.setFeatured(true);
            }
        }
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        return switch (sort.toLowerCase(Locale.ROOT)) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "productName");
            case "name_desc" -> Sort.by(Sort.Direction.DESC, "productName");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "id");
            case "on_sale_order" -> Sort.by(Sort.Direction.ASC, "onSaleOrder").and(Sort.by(Sort.Direction.DESC, "id"));
            case "new_arrival_order" -> Sort.by(Sort.Direction.ASC, "newArrivalOrder").and(Sort.by(Sort.Direction.DESC, "id"));
            case "featured_order" -> Sort.by(Sort.Direction.ASC, "featuredOrder").and(Sort.by(Sort.Direction.DESC, "id"));
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean matchesKeyword(Product product, String keyword) {
        if (keyword == null) {
            return true;
        }

        return containsIgnoreCase(product.getProductName(), keyword)
                || containsIgnoreCase(product.getDiscription(), keyword)
                || containsIgnoreCase(product.getBrand(), keyword)
                || containsIgnoreCase(product.getSku(), keyword);
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT));
    }

    private boolean matchesExact(String value, String expected) {
        return expected == null || Objects.equals(value, expected);
    }

    private boolean matchesExactIgnoreCase(String value, String expected) {
        return expected == null || (value != null && value.equalsIgnoreCase(expected));
    }

    private boolean matchesAge(Product product, Integer age) {
        if (age == null) {
            return true;
        }

        boolean matchesMin = product.getAgeMin() == null || product.getAgeMin() <= age;
        boolean matchesMax = product.getAgeMax() == null || product.getAgeMax() >= age;
        return matchesMin && matchesMax;
    }

    private boolean matchesAgeRange(Product product, Integer ageFrom, Integer ageTo) {
        if (ageFrom == null && ageTo == null) {
            return true;
        }
        
        Integer pMin = product.getAgeMin();
        Integer pMax = product.getAgeMax();
        
        // If product doesn't have age requirement, it fits any range
        if (pMin == null && pMax == null) {
            return true;
        }

        // Logic for checking overlap between filter [ageFrom, ageTo] and product [pMin, pMax]
        int minF = ageFrom != null ? ageFrom : 0;
        int maxF = ageTo != null ? ageTo : 999;
        int minP = pMin != null ? pMin : 0;
        int maxP = pMax != null ? pMax : 999;

        return Math.max(minF, minP) <= Math.min(maxF, maxP);
    }

    private boolean matchesTopping(Product product, Long toppingId) {
        if (toppingId == null) {
            return true;
        }
        if (product.getToppings() == null || product.getToppings().isEmpty()) {
            return false;
        }
        return product.getToppings().stream().anyMatch(t -> t.getId().equals(toppingId));
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

    private BigDecimal calculateDiscountAmount(Product product) {
        if (product == null || product.getOriginalPrice() == null || product.getPrice() == null) {
            return null;
        }
        BigDecimal discount = product.getOriginalPrice().subtract(product.getPrice());
        return discount.compareTo(BigDecimal.ZERO) > 0 ? discount : BigDecimal.ZERO;
    }
}
