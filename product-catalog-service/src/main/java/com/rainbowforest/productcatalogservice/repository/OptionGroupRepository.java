package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.OptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OptionGroupRepository extends JpaRepository<OptionGroup, Long> {
}
