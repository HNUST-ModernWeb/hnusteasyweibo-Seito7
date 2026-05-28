package com.sharehub.controller;

import com.sharehub.dto.ApiResponse;
import com.sharehub.dto.CommentRequest;
import com.sharehub.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> addComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        ApiResponse<?> response = commentService.addComment(postId, userId, request.getContent());
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<?>> deleteComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        ApiResponse<?> response = commentService.deleteComment(commentId, userId, postId);
        return ResponseEntity.status(response.getCode()).body(response);
    }
}