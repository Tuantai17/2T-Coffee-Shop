package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.OptionGroup;
import com.rainbowforest.productcatalogservice.repository.OptionGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OptionGroupServiceImpl implements OptionGroupService {

    @Autowired
    private OptionGroupRepository optionGroupRepository;

    @Override
    public List<OptionGroup> getAllOptionGroups() {
        return optionGroupRepository.findAll();
    }

    @Override
    public OptionGroup getOptionGroupById(Long id) {
        return optionGroupRepository.findById(id).orElse(null);
    }

    @Override
    public OptionGroup saveOptionGroup(OptionGroup group) {
        if (group.getOptions() != null) {
            group.getOptions().forEach(option -> option.setOptionGroup(group));
        }
        return optionGroupRepository.save(group);
    }

    @Override
    public void deleteOptionGroup(Long id) {
        optionGroupRepository.deleteById(id);
    }
}
