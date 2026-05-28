package com.sharehub.controller;

import com.sharehub.dto.ApiResponse;
import com.sharehub.service.FileStorageService;
import com.sharehub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<?>> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> updates) {
        Long userId = Long.parseLong(userDetails.getUsername());
        ApiResponse<?> response = userService.updateProfile(userId, updates);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<?>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        Long userId = Long.parseLong(userDetails.getUsername());

        // Validate
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "No file uploaded"));
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "File too large (max 5MB)"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Only image files allowed"));
        }

        // Upload using FileStorageService
        ApiResponse<?> uploadResult = fileStorageService.uploadImages(List.of(file));
        if (uploadResult.getCode() != 200) {
            return ResponseEntity.status(uploadResult.getCode()).body(uploadResult);
        }

        @SuppressWarnings("unchecked")
        List<String> urls = (List<String>) ((Map<String, Object>) uploadResult.getData()).get("urls");
        if (urls == null || urls.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Upload failed"));
        }

        String avatarUrl = urls.get(0);

        // Update user avatar
        userService.updateProfile(userId, Map.of("avatar", avatarUrl));

        return ResponseEntity.ok(ApiResponse.success("Avatar updated", Map.of("avatarUrl", avatarUrl)));
    }
}