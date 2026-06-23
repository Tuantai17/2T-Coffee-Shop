package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByParentId(Long parentId);
    List<Menu> findAllByOrderByDisplayOrderAsc();
    List<Menu> findByIsActiveTrueOrderByDisplayOrderAsc();
    boolean existsBySlug(String slug);
    boolean existsByParentId(Long parentId);
}
