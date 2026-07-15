package com.rainbowforest.productcatalogservice.service;

import java.math.BigDecimal;
import java.util.List;

import com.rainbowforest.productcatalogservice.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    public List<Product> getAllProduct();
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);
    public Product getProductBySlug(String slug);
    public List<Product> getAllProductsByName(String name);
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
    );
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
    );
    public Product addProduct(Product product);
    public Product updateProduct(Long id, Product product);
    public void softDeleteProduct(Long productId, String deletedBy, String deleteReason);
    public void restoreProduct(Long productId);
    public void permanentlyDeleteProduct(Long productId);
    public List<Product> getTrashProducts();
}
