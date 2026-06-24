package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Collection;
import com.rainbowforest.productcatalogservice.repository.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class CollectionServiceImpl implements CollectionService {

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @Override
    public List<Collection> getCollections(boolean featuredOnly, boolean activeOnly) {
        if (featuredOnly) {
            return collectionRepository.findAllByFeaturedTrueAndActiveTrueOrderBySortOrderAscIdAsc();
        }
        if (activeOnly) {
            return collectionRepository.findAllByActiveTrueOrderBySortOrderAscIdAsc();
        }
        return collectionRepository.findAll();
    }

    @Override
    public Collection getCollectionById(Long id) {
        return collectionRepository.findById(id).orElse(null);
    }

    @Override
    public Collection getCollectionBySlug(String slug) {
        return collectionRepository.findBySlug(slug).orElse(null);
    }

    @Override
    public Collection addCollection(Collection collection) {
        prepareCollection(collection);
        return collectionRepository.save(collection);
    }

    @Override
    public Collection updateCollection(Long id, Collection collectionDetails) {
        Collection collection = getCollectionById(id);
        if (collection == null) {
            return null;
        }

        if (collection.getBannerUrl() != null && collectionDetails.getBannerUrl() != null 
                && !collection.getBannerUrl().equals(collectionDetails.getBannerUrl())) {
            fileUploadService.deleteImage(collection.getBannerUrl());
        }

        collection.setName(collectionDetails.getName());
        collection.setSlug(collectionDetails.getSlug());
        collection.setSubtitle(collectionDetails.getSubtitle());
        collection.setDescription(collectionDetails.getDescription());
        collection.setBannerUrl(collectionDetails.getBannerUrl());
        collection.setTargetUrl(collectionDetails.getTargetUrl());
        collection.setCategoryFilter(collectionDetails.getCategoryFilter());
        collection.setBrandFilter(collectionDetails.getBrandFilter());
        collection.setBadgeFilter(collectionDetails.getBadgeFilter());
        collection.setActive(collectionDetails.isActive());
        collection.setFeatured(collectionDetails.isFeatured());
        collection.setSortOrder(collectionDetails.getSortOrder());
        prepareCollection(collection);
        return collectionRepository.save(collection);
    }

    @Override
    public void deleteCollection(Long id) {
        Collection collection = getCollectionById(id);
        if (collection != null && collection.getBannerUrl() != null) {
            fileUploadService.deleteImage(collection.getBannerUrl());
        }
        collectionRepository.deleteById(id);
    }

    private void prepareCollection(Collection collection) {
        if (collection.getSlug() == null || collection.getSlug().isBlank()) {
            collection.setSlug(slugify(collection.getName()));
        } else {
            collection.setSlug(slugify(collection.getSlug()));
        }
        if (collection.getSortOrder() == null) {
            collection.setSortOrder(0);
        }
        if (collection.getTargetUrl() == null || collection.getTargetUrl().isBlank()) {
            collection.setTargetUrl("/products");
        }
    }

    private String slugify(String value) {
        if (value == null) {
            return null;
        }

        String slug = value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? null : slug;
    }
}
