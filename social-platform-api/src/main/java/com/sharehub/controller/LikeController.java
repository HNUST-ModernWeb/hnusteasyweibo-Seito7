package com.sharehub.controller;

import com.sharehub.dto.ApiResponse;
import com.sharehub.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> toggleLike(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long postId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(likeService.toggleLike(postId, userId));
    }
}
