package com.rainbowforest.productcatalogservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rainbowforest.productcatalogservice.common.exception.ExternalServiceException;
import com.rainbowforest.productcatalogservice.common.exception.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaServiceImpl implements MediaService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/svg+xml"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif",
            "bmp",
            "svg"
    );

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadImage(MultipartFile file) {
        validateImage(file);

        try {
            String publicId = "news/" + UUID.randomUUID();

            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "news_articles",
                            "resource_type", "image"
                    )
            );

            Map<String, String> result = new HashMap<>();
            result.put("url", String.valueOf(uploadResult.get("secure_url")));
            return result;
        } catch (IOException e) {
            throw new ExternalServiceException(
                    "IMAGE_UPLOAD_FAILED",
                    "Khong the tai anh len. Vui long thu lai.",
                    e
            );
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("INVALID_IMAGE_FILE", "File anh dang rong.");
        }

        if (!isSupportedImage(file)) {
            throw new ValidationException(
                    "INVALID_IMAGE_FILE",
                    "Anh tai len khong hop le. Chi chap nhan JPG, JPEG, PNG, WEBP, GIF, BMP, SVG."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ValidationException("IMAGE_TOO_LARGE", "Dung luong anh khong duoc vuot qua 5MB.");
        }
    }

    private boolean isSupportedImage(MultipartFile file) {
        String contentType = normalize(file.getContentType());
        if (contentType.startsWith("image/") || ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return true;
        }

        String extension = extractExtension(file.getOriginalFilename());
        return ALLOWED_EXTENSIONS.contains(extension);
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }

        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
