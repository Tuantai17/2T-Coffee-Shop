package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Collection;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.CollectionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminCollectionController {

    @Autowired
    private CollectionService collectionService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping("/collections")
    public ResponseEntity<Collection> addCollection(@RequestBody Collection collection, HttpServletRequest request) {
        if (collection == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        Collection created = collectionService.addCollection(collection);
        return new ResponseEntity<>(
                created,
                headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/collections/{id}")
    public ResponseEntity<Collection> updateCollection(@PathVariable("id") Long id, @RequestBody Collection collection) {
        Collection updated = collectionService.updateCollection(id, collection);
        if (updated == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updated, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @DeleteMapping("/collections/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable("id") Long id) {
        Collection collection = collectionService.getCollectionById(id);
        if (collection == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        collectionService.deleteCollection(id);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
