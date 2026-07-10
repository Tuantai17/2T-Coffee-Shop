package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/admin")
public class AdminProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping(value = "/products")
    public ResponseEntity<?> addProduct(@RequestBody Product product, HttpServletRequest request){
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    	if(product != null) {
    		try {
    			productService.addProduct(product);
    	        return new ResponseEntity<Product>(
    	        		product,
    	        		headerGenerator.getHeadersForSuccessPostMethod(request, product.getId()),
    	        		HttpStatus.CREATED);
    		}catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Product>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }
    
    @PutMapping(value = "/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable("id") Long id, @RequestBody Product product, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    	if(product != null) {
    		try {
    			Product updatedProduct = productService.updateProduct(id, product);
    			if (updatedProduct != null) {
    				return new ResponseEntity<Product>(
    						updatedProduct,
    						headerGenerator.getHeadersForSuccessGetMethod(),
    						HttpStatus.OK);
    			}
    			return new ResponseEntity<Product>(
    					headerGenerator.getHeadersForError(),
    					HttpStatus.NOT_FOUND);
    		} catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Product>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }

    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable("id") Long id,
            @RequestParam(value = "deletedBy", required = false) String deletedBy,
            @RequestParam(value = "deleteReason", required = false) String deleteReason,
            HttpServletRequest request
    ) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    	try {
    		productService.softDeleteProduct(id, deletedBy, deleteReason);
    	    return new ResponseEntity<Void>(
    	    		headerGenerator.getHeadersForSuccessGetMethod(),
    	    		HttpStatus.OK);
    	} catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        } catch (Exception e) {
			e.printStackTrace();
 	        return new ResponseEntity<Void>(
    	    		headerGenerator.getHeadersForError(),
    	    		HttpStatus.INTERNAL_SERVER_ERROR);
		}
    }

    @GetMapping(value = "/products/trash")
    public ResponseEntity<List<Product>> getTrashProducts() {
        List<Product> products = productService.getTrashProducts();
        return new ResponseEntity<>(products, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PatchMapping(value = "/products/{id}/restore")
    public ResponseEntity<Void> restoreProduct(@PathVariable("id") Long id) {
        try {
            productService.restoreProduct(id);
            return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping(value = "/products/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteProduct(@PathVariable("id") Long id) {
        try {
            productService.permanentlyDeleteProduct(id);
            return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
