package com.rainbowforest.productcatalogservice.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface MediaService {
    Map<String, String> uploadImage(MultipartFile file);
}
