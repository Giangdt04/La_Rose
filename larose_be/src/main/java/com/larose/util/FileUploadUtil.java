package com.larose.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.exceptions.NotFound;
import com.cloudinary.utils.ObjectUtils;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.FilenameUtils;


import java.io.IOException;
import java.util.Map;

@Getter
@Setter
@RequiredArgsConstructor
@Slf4j
@Service
public class FileUploadUtil {
    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "https://asset.cloudinary.com/dvxobkvcx/ec27e05c5476c3c95ce0d4cc48841456";
        }

        try {
            String originalName = FilenameUtils.getBaseName(file.getOriginalFilename());
            String extension = FilenameUtils.getExtension(file.getOriginalFilename());
            String publicId = "avatars/" + originalName + "." + extension;

            log.info(" Checking if '{}' exists on Cloudinary...", publicId);

            try {
                Map existing = cloudinary.api().resource(publicId, ObjectUtils.asMap("resource_type", "image"));
                String existingUrl = existing.get("secure_url").toString();
//                log.info(" File '{}' already exists. Using existing URL: {}", file.getOriginalFilename(), existingUrl);
                return existingUrl;
            } catch (NotFound e) {
//                log.info("️ File '{}' not found on Cloudinary. Uploading new one...", publicId);
            }

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "resource_type", "image",
                            "unique_filename", false,
                            "overwrite", false
                    ));

            String newUrl = uploadResult.get("secure_url").toString();
            log.info(" Upload success. New URL: {}", newUrl);
            return newUrl;

        } catch (Exception e) {
            log.error(" Upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Upload failed", e);
        }
    }


//    private String checkFile(MultipartFile file) throws IOException {
//        String contentType = file.getContentType();
//        if (contentType == null || !contentType.startsWith("image/")) {
//            throw new IllegalArgumentException("file invalid");
//        }
//
//        try {
//            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
//                    ObjectUtils.asMap("resource_type", "auto", "folder", "avatars"));
//            return uploadResult.get("url").toString();
//        } catch (IOException e) {
//            log.error("Upload file failed: {}", e.getMessage());
//            throw new IllegalArgumentException("upload fail");
//        }
//    }
}
