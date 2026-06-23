package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Banner;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/banners")
    public ResponseEntity<List<Banner>> getBanners(
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "activeOnly", defaultValue = "true") boolean activeOnly
    ) {
        List<Banner> banners = bannerService.getAllBanners(position, activeOnly);
        return new ResponseEntity<>(banners, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
