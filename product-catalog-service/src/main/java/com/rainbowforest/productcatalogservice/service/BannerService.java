package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Banner;

import java.util.List;

public interface BannerService {
    List<Banner> getAllBanners(String position, boolean activeOnly);
    Banner getBannerById(Long id);
    Banner addBanner(Banner banner);
    Banner updateBanner(Long id, Banner banner);
    void deleteBanner(Long id);
}
