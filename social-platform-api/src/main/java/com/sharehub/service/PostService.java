package com.sharehub.service;

import com.sharehub.dto.ApiResponse;
import com.sharehub.dto.PostRequest;
import com.sharehub.entity.Post;
import com.sharehub.entity.User;
import com.sharehub.repository.CommentRepository;
import com.sharehub.repository.LikeRepository;
import com.sharehub.repository.PostRepository;
import com.sharehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public ApiResponse<?> createPost(Long userId, PostRequest request) {
        User author = userRepository.findById(userId).orElse(null);
        if (author == null) return ApiResponse.error(404, "User not found");

        Post post = Post.builder()
                .content(request.getContent())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .visibility(request.getVisibility())
                .author(author)
                .build();

        postRepository.save(post);
        return ApiResponse.success("Post created", toPostMap(post, userId));
    }

    @Transactional(readOnly = true)
    public ApiResponse<?> getFeed(int page, int size, Long currentUserId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Post> posts;
        if (currentUserId != null) {
            posts = postRepository.findVisiblePosts(currentUserId, pageRequest);
        } else {
            posts = postRepository.findByVisibility("public", pageRequest);
        }

        List<Map<String, Object>> postList = posts.getContent().stream()
                .map(p -> toPostMap(p, currentUserId))
                .toList();

        return ApiResponse.success(Map.of(
                "content", postList,
                "totalPages", posts.getTotalPages(),
                "totalElements", posts.getTotalElements(),
                "currentPage", page
        ));
    }

    @Transactional(readOnly = true)
    public ApiResponse<?> getPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return ApiResponse.error(404, "Post not found");
        return ApiResponse.success(toPostMap(post, currentUserId));
    }

    @Transactional(readOnly = true)
    public ApiResponse<?> getUserPosts(Long userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByAuthorId(userId, pageRequest);

        List<Map<String, Object>> postList = posts.getContent().stream()
                .map(p -> toPostMap(p, userId))
                .toList();

        return ApiResponse.success(Map.of(
                "content", postList,
                "totalPages", posts.getTotalPages(),
                "totalElements", posts.getTotalElements()
        ));
    }

    @Transactional
    public ApiResponse<?> deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return ApiResponse.error(404, "Post not found");
        if (!post.getAuthor().getId().equals(userId)) return ApiResponse.error(403, "Permission denied");
        // Delete related data first to avoid foreign key constraint violations
        likeRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
        return ApiResponse.success("Post deleted", null);
    }

    private Map<String, Object> toPostMap(Post post, Long currentUserId) {
        boolean liked = currentUserId != null && likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);

        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("content", post.getContent());
        map.put("images", post.getImages());
        map.put("visibility", post.getVisibility());
        map.put("likeCount", post.getLikeCount());
        map.put("commentCount", post.getCommentCount());
        map.put("liked", liked);
        map.put("createdAt", post.getCreatedAt().toString());
        map.put("author", Map.of(
                "id", post.getAuthor().getId(),
                "username", post.getAuthor().getUsername(),
                "nickname", post.getAuthor().getNickname(),
                "avatar", post.getAuthor().getAvatar()
        ));
        return map;
    }
}