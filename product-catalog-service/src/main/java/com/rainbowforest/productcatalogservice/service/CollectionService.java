package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Collection;

import java.util.List;

public interface CollectionService {
    List<Collection> getCollections(boolean featuredOnly, boolean activeOnly);
    Collection getCollectionById(Long id);
    Collection getCollectionBySlug(String slug);
    Collection addCollection(Collection collection);
    Collection updateCollection(Long id, Collection collection);
    void deleteCollection(Long id);
}
