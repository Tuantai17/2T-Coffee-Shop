package com.rainbowforest.productcatalogservice.repository;

import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rainbowforest.productcatalogservice.entity.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    public List<Product> findAllByCategoryAndIsDeletedFalse(String category);
    public List<Product> findAllByProductNameContainingIgnoreCaseAndIsDeletedFalse(String name);
    Optional<Product> findBySlugAndIsDeletedFalse(String slug);
    Optional<Product> findByIdAndIsDeletedFalse(Long id);
    List<Product> findAllByIsDeletedFalse();
    List<Product> findAllByIsDeletedTrue();

    @Query("""
        select p from Product p
        where p.isDeleted = false
          and (:keyword is null
            or lower(p.productName) like lower(concat('%', :keyword, '%'))
            or lower(coalesce(p.discription, '')) like lower(concat('%', :keyword, '%'))
            or lower(coalesce(p.brand, '')) like lower(concat('%', :keyword, '%'))
            or lower(coalesce(p.sku, '')) like lower(concat('%', :keyword, '%')))
          and (:category is null or p.category = :category)
          and (:brand is null or lower(coalesce(p.brand, '')) = lower(:brand))
          and (:minPrice is null or p.price >= :minPrice)
          and (:maxPrice is null or p.price <= :maxPrice)
          and (:badge is null or lower(coalesce(p.badge, '')) = lower(:badge))
          and (:status is null or lower(coalesce(p.status, '')) = lower(:status))
    """)
    List<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("brand") String brand,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("badge") String badge,
            @Param("status") String status,
            Sort sort);
}
