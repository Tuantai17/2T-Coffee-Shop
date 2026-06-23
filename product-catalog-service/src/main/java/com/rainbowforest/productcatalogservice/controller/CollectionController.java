package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Collection;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/collections")
    public ResponseEntity<List<Collection>> getCollections(
            @RequestParam(value = "featuredOnly", defaultValue = "false") boolean featuredOnly,
            @RequestParam(value = "activeOnly", defaultValue = "true") boolean activeOnly
    ) {
        List<Collection> collections = collectionService.getCollections(featuredOnly, activeOnly);
        return new ResponseEntity<>(collections, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping("/collections/{slug}")
    public ResponseEntity<Collection> getCollectionBySlug(@PathVariable("slug") String slug) {
        Collection collection = collectionService.getCollectionBySlug(slug);
        if (collection == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(collection, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
