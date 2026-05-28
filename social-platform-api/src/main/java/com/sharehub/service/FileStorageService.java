package com.sharehub.service;

import com.sharehub.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private final Set<String> allowedTypes = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final int MAX_FILES = 9;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadPath) {
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory", e);
        }
    }

    public ApiResponse<?> uploadImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ApiResponse.error(400, "No files selected");
        }

        if (files.size() > MAX_FILES) {
            return ApiResponse.error(400, "Max " + MAX_FILES + " images allowed");
        }

        List<String> urls = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            if (file.getSize() > MAX_FILE_SIZE) {
                errors.add(file.getOriginalFilename() + " exceeds 10MB limit");
                continue;
            }

            if (!allowedTypes.contains(file.getContentType())) {
                errors.add(file.getOriginalFilename() + " unsupported type");
                continue;
            }

            try {
                String ext = getExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID().toString() + ext;
                Path targetPath = uploadDir.resolve(filename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                urls.add("/api/files/" + filename);
            } catch (IOException e) {
                errors.add(file.getOriginalFilename() + " upload failed");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("urls", urls);
        if (!errors.isEmpty()) {
            result.put("errors", errors);
        }

        return ApiResponse.success("Upload complete", result);
    }

    public Path getFilePath(String filename) {
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!filePath.startsWith(uploadDir)) {
            throw new RuntimeException("Invalid file path");
        }
        return filePath;
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot).toLowerCase() : "";
    }
}