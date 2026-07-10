package com.rainbowforest.productcatalogservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.entity.Banner;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.CategoryRepository;
import com.rainbowforest.productcatalogservice.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ImageMigrationService {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BannerRepository bannerRepository;

    public String migrateAll() {
        int count = 0;
        
        // Migrate Products
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            String url = p.getImageUrl();
            if (url != null && !url.contains("cloudinary.com") && url.startsWith("http")) {
                try {
                    Map res = cloudinary.uploader().upload(url, ObjectUtils.asMap("folder", "website_nuoc/products"));
                    p.setImageUrl(res.get("secure_url").toString());
                    productRepository.save(p);
                    count++;
                } catch (Exception e) {
                    System.out.println("Failed to migrate product image: " + url);
                    e.printStackTrace();
                }
            }
        }

        // Migrate Categories
        List<Category> categories = categoryRepository.findAll();
        for (Category c : categories) {
            String url = c.getImageUrl();
            if (url != null && !url.contains("cloudinary.com") && url.startsWith("http")) {
                try {
                    Map res = cloudinary.uploader().upload(url, ObjectUtils.asMap("folder", "website_nuoc/categories"));
                    c.setImageUrl(res.get("secure_url").toString());
                    categoryRepository.save(c);
                    count++;
                } catch (Exception e) {
                    System.out.println("Failed to migrate category image: " + url);
                    e.printStackTrace();
                }
            }
        }

        // Migrate Banners
        List<Banner> banners = bannerRepository.findAll();
        for (Banner b : banners) {
            String url = b.getImageUrl();
            if (url != null && !url.contains("cloudinary.com") && url.startsWith("http")) {
                try {
                    Map res = cloudinary.uploader().upload(url, ObjectUtils.asMap("folder", "website_nuoc/banners"));
                    b.setImageUrl(res.get("secure_url").toString());
                    bannerRepository.save(b);
                    count++;
                } catch (Exception e) {
                    System.out.println("Failed to migrate banner image: " + url);
                    e.printStackTrace();
                }
            }
        }
        
        return "Migrated " + count + " images to Cloudinary successfully.";
    }
}
