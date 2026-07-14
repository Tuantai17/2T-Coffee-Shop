package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.StoreContactInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreContactRepository extends JpaRepository<StoreContactInformation, Long> {
}
