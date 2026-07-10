package com.rainbowforest.productcatalogservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileUploadService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folderName) throws IOException {
        String targetFolder = (folderName != null && !folderName.trim().isEmpty()) ? "website_nuoc/" + folderName : "website_nuoc/others";
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", targetFolder,
                "resource_type", "auto"
        ));
        return uploadResult.get("secure_url").toString();
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("res.cloudinary.com")) return;
        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String path = parts[1];
                // Remove version if present e.g. "v1712345/"
                if (path.matches("^v\\d+/.*")) {
                    path = path.replaceFirst("^v\\d+/", "");
                }
                // Remove extension
                int lastDot = path.lastIndexOf('.');
                if (lastDot != -1) {
                    path = path.substring(0, lastDot);
                }
                cloudinary.uploader().destroy(path, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            System.err.println("Failed to delete image from Cloudinary: " + imageUrl);
            e.printStackTrace();
        }
    }

    public void deleteProductFolder(String sku) {
        if (sku == null || sku.trim().isEmpty()) return;
        String folderPath = "website_nuoc/products/" + sku;
        try {
            // Delete all resources inside the folder first
            cloudinary.api().deleteResourcesByPrefix(folderPath + "/", ObjectUtils.emptyMap());
            // Then delete the empty folder
            cloudinary.api().deleteFolder(folderPath, ObjectUtils.emptyMap());
        } catch (Exception e) {
            System.err.println("Failed to delete product folder from Cloudinary: " + folderPath);
            e.printStackTrace();
        }
    }
}
