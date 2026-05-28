package com.sharehub.controller;

import com.sharehub.dto.ApiResponse;
import com.sharehub.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/follow/{userId}")
    public ResponseEntity<ApiResponse<?>> toggleFollow(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        Long myId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(followService.toggleFollow(myId, userId));
    }

    @GetMapping("/follow/{userId}")
    public ResponseEntity<ApiResponse<?>> checkFollow(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        Long myId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(followService.isFollowing(myId, userId));
    }
}