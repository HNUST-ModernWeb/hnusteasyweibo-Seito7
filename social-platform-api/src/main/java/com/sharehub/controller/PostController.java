package com.sharehub.controller;

import com.sharehub.dto.*;
import com.sharehub.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PostRequest request) {
        Long userId = extractUserId(userDetails);
        ApiResponse<?> response = postService.createPost(userId, request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getFeed(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = userDetails != null ? extractUserId(userDetails) : null;
        return ResponseEntity.ok(postService.getFeed(page, size, userId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<?>> getPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long postId) {
        Long userId = userDetails != null ? extractUserId(userDetails) : null;
        return ResponseEntity.ok(postService.getPost(postId, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<?>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getUserPosts(userId, page, size));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<?>> deletePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long postId) {
        Long userId = extractUserId(userDetails);
        ApiResponse<?> response = postService.deletePost(postId, userId);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    private Long extractUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        return Long.parseLong(userDetails.getUsername());
    }
}
