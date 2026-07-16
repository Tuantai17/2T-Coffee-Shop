package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Topping;
import com.rainbowforest.productcatalogservice.repository.ToppingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToppingServiceImpl implements ToppingService {

    @Autowired
    private ToppingRepository toppingRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @Override
    public List<Topping> getAllToppings() {
        return toppingRepository.findAll();
    }

    @Override
    public Topping getToppingById(Long id) {
        return toppingRepository.findById(id).orElse(null);
    }

    @Override
    public Topping saveTopping(Topping topping) {
        return toppingRepository.save(topping);
    }

    @Override
    public Topping updateTopping(Long id, Topping toppingDetails) {
        Topping existingTopping = toppingRepository.findById(id).orElse(null);
        if (existingTopping != null) {
            if (existingTopping.getImageUrl() != null && toppingDetails.getImageUrl() != null 
                    && !existingTopping.getImageUrl().equals(toppingDetails.getImageUrl())) {
                fileUploadService.deleteImage(existingTopping.getImageUrl());
            }
            existingTopping.setName(toppingDetails.getName());
            existingTopping.setPrice(toppingDetails.getPrice());
            existingTopping.setImageUrl(toppingDetails.getImageUrl());
            return toppingRepository.save(existingTopping);
        }
        return null;
    }

    @Override
    public void deleteTopping(Long id) {
        Topping topping = getToppingById(id);
        if (topping != null && topping.getImageUrl() != null) {
            fileUploadService.deleteImage(topping.getImageUrl());
        }
        toppingRepository.deleteById(id);
    }
}
