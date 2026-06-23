package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Banner;
import com.rainbowforest.productcatalogservice.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BannerServiceImpl implements BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Override
    public List<Banner> getAllBanners(String position, boolean activeOnly) {
        if (position != null && !position.isBlank()) {
            return activeOnly
                    ? bannerRepository.findAllByPositionAndActiveTrueOrderBySortOrderAscIdAsc(position)
                    : bannerRepository.findAllByPositionOrderBySortOrderAscIdAsc(position);
        }
        return activeOnly
                ? bannerRepository.findAllByActiveTrueOrderBySortOrderAscIdAsc()
                : bannerRepository.findAll();
    }

    @Override
    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id).orElse(null);
    }

    @Override
    public Banner addBanner(Banner banner) {
        prepareBanner(banner);
        return bannerRepository.save(banner);
    }

    @Override
    public Banner updateBanner(Long id, Banner bannerDetails) {
        Banner banner = getBannerById(id);
        if (banner == null) {
            return null;
        }

        banner.setTitle(bannerDetails.getTitle());
        banner.setSubtitle(bannerDetails.getSubtitle());
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setTargetUrl(bannerDetails.getTargetUrl());
        banner.setPosition(bannerDetails.getPosition());
        banner.setSortOrder(bannerDetails.getSortOrder());
        banner.setActive(bannerDetails.isActive());
        prepareBanner(banner);
        return bannerRepository.save(banner);
    }

    @Override
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    private void prepareBanner(Banner banner) {
        if (banner.getPosition() == null || banner.getPosition().isBlank()) {
            banner.setPosition("HOME_HERO");
        }
        if (banner.getSortOrder() == null) {
            banner.setSortOrder(0);
        }
    }
}
