package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.OptionGroup;

import java.util.List;

public interface OptionGroupService {
    List<OptionGroup> getAllOptionGroups();
    OptionGroup getOptionGroupById(Long id);
    OptionGroup saveOptionGroup(OptionGroup group);
    void deleteOptionGroup(Long id);
}
