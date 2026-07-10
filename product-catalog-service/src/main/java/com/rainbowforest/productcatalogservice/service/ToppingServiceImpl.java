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
    public void deleteTopping(Long id) {
        toppingRepository.deleteById(id);
    }
}
