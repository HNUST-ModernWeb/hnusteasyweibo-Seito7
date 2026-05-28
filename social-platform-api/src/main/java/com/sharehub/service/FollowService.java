package com.sharehub.service;

import com.sharehub.dto.ApiResponse;
import com.sharehub.entity.Follow;
import com.sharehub.entity.User;
import com.sharehub.repository.FollowRepository;
import com.sharehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse<?> toggleFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            return ApiResponse.error(400, "Cannot follow yourself");
        }

        User following = userRepository.findById(followingId).orElse(null);
        if (following == null) return ApiResponse.error(404, "User not found");

        var existing = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            long count = followRepository.countByFollowingId(followingId);
            return ApiResponse.success("Unfollowed", Map.of("following", false, "followerCount", count));
        } else {
            User follower = userRepository.findById(followerId).orElse(null);
            Follow follow = Follow.builder().follower(follower).following(following).build();
            followRepository.save(follow);
            long count = followRepository.countByFollowingId(followingId);
            return ApiResponse.success("Followed", Map.of("following", true, "followerCount", count));
        }
    }

    public ApiResponse<?> isFollowing(Long followerId, Long followingId) {
        boolean following = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        long followerCount = followRepository.countByFollowingId(followingId);
        long followingCount = followRepository.countByFollowerId(followerId);
        return ApiResponse.success(Map.of(
                "following", following,
                "followerCount", followerCount,
                "followingCount", followingCount
        ));
    }
}