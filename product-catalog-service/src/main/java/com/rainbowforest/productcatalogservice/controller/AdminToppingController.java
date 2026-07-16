package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Topping;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ToppingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminToppingController {

    @Autowired
    private ToppingService toppingService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/toppings")
    public ResponseEntity<List<Topping>> getAllToppings(HttpServletRequest request) {
        return new ResponseEntity<>(
            toppingService.getAllToppings(),
            headerGenerator.getHeadersForSuccessGetMethod(),
            HttpStatus.OK
        );
    }

    @PostMapping("/toppings")
    public ResponseEntity<?> addTopping(@RequestBody Topping topping, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            Topping saved = toppingService.saveTopping(topping);
            return new ResponseEntity<>(
                saved,
                headerGenerator.getHeadersForSuccessPostMethod(request, saved.getId()),
                HttpStatus.CREATED
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/toppings/{id}")
    public ResponseEntity<?> updateTopping(@PathVariable("id") Long id, @RequestBody Topping topping, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            Topping updated = toppingService.updateTopping(id, topping);
            if (updated == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(
                updated,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/toppings/{id}")
    public ResponseEntity<?> deleteTopping(@PathVariable("id") Long id, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            toppingService.deleteTopping(id);
            return new ResponseEntity<>(
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
