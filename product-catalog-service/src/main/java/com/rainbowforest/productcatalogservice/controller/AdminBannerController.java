package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Banner;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.BannerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminBannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping("/banners")
    public ResponseEntity<Banner> addBanner(@RequestBody Banner banner, HttpServletRequest request) {
        if (banner == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        Banner created = bannerService.addBanner(banner);
        return new ResponseEntity<>(
                created,
                headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable("id") Long id, @RequestBody Banner banner) {
        Banner updated = bannerService.updateBanner(id, banner);
        if (updated == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updated, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable("id") Long id) {
        Banner banner = bannerService.getBannerById(id);
        if (banner == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        bannerService.deleteBanner(id);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
