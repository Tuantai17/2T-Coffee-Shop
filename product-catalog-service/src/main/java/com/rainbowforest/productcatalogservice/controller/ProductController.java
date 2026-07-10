package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/products")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "badge", required = false) String badge,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "sort", required = false) String sort
    ){
        List<Product> products;

        if (keyword == null && name != null) {
            keyword = name;
        }

        boolean hasAdvancedFilters = keyword != null
                || category != null
                || brand != null
                || minPrice != null
                || maxPrice != null
                || badge != null
                || status != null
                || sort != null;

        if (hasAdvancedFilters) {
            products = productService.searchProducts(
                    keyword,
                    category,
                    brand,
                    minPrice,
                    maxPrice,
                    null,
                    null,
                    null,
                    null,
                    badge,
                    status,
                    sort
            );
        } else {
            products = productService.getAllProduct();
        }

        return new ResponseEntity<List<Product>>(
                products,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/products/paged")
    public ResponseEntity<Page<Product>> getAllProductsPaged(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "badge", required = false) String badge,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size
    ){
        if (keyword == null && name != null) {
            keyword = name;
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<Product> productsPage = productService.searchProductsPaged(
                keyword,
                category,
                brand,
                minPrice,
                maxPrice,
                null,
                null,
                null,
                null,
                null,
                badge,
                status,
                sort,
                pageable
        );

        return new ResponseEntity<Page<Product>>(
                productsPage,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping (value = "/products/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable ("id") long id){
        Product product =  productService.getProductById(id);
        if(product != null) {
        	return new ResponseEntity<Product>(
        			product,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/slug/{slug}")
    public ResponseEntity<Product> getOneProductBySlug(@PathVariable("slug") String slug) {
        Product product = productService.getProductBySlug(slug);
        if(product != null) {
            return new ResponseEntity<Product>(
                    product,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }
}
