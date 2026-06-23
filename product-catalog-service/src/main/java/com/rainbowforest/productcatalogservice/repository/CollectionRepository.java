package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    List<Collection> findAllByActiveTrueOrderBySortOrderAscIdAsc();
    List<Collection> findAllByFeaturedTrueAndActiveTrueOrderBySortOrderAscIdAsc();
    Optional<Collection> findBySlug(String slug);
}
