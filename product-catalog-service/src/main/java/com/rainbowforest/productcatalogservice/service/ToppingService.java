package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Topping;

import java.util.List;

public interface ToppingService {
    List<Topping> getAllToppings();
    Topping getToppingById(Long id);
    Topping saveTopping(Topping topping);
    void deleteTopping(Long id);
}
