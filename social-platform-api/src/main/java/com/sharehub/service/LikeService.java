package com.sharehub.service;

import com.sharehub.dto.ApiResponse;
import com.sharehub.entity.Like;
import com.sharehub.entity.Post;
import com.sharehub.entity.User;
import com.sharehub.repository.LikeRepository;
import com.sharehub.repository.PostRepository;
import com.sharehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse<?> toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            return ApiResponse.error(404, "Post not found");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ApiResponse.error(404, "User not found");
        }

        var existing = likeRepository.findByPostIdAndUserId(postId, userId);

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
            return ApiResponse.success("Unliked", Map.of("liked", false, "likeCount", post.getLikeCount()));
        } else {
            Like like = Like.builder().post(post).user(user).build();
            likeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return ApiResponse.success("Liked", Map.of("liked", true, "likeCount", post.getLikeCount()));
        }
    }
}