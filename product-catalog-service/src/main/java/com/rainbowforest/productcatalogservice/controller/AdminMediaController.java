package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/admin/media")
public class AdminMediaController {

    @Autowired
    private MediaService mediaService;

    @PostMapping("/images")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mediaService.uploadImage(file));
    }
}
