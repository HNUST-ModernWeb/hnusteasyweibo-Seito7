package com.sharehub.service;

import com.sharehub.dto.*;
import com.sharehub.entity.User;
import com.sharehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ApiResponse<?> register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ApiResponse.error(400, "Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname() != null ? request.getNickname() : request.getUsername())
                .avatar("")
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getUsername());

        return ApiResponse.success("Register success", java.util.Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername(),
                "nickname", user.getNickname(),
                "avatar", user.getAvatar(),
                "createdAt", user.getCreatedAt().toString()
        ));
    }

    public ApiResponse<?> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.error(401, "Invalid username or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername());

        return ApiResponse.success("Login success", java.util.Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername(),
                "nickname", user.getNickname(),
                "avatar", user.getAvatar(),
                "bio", user.getBio() != null ? user.getBio() : "",
                "location", user.getLocation() != null ? user.getLocation() : "",
                "createdAt", user.getCreatedAt().toString()
        ));
    }

    public ApiResponse<?> getProfile(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ApiResponse.error(404, "User not found");
        }

        return ApiResponse.success(java.util.Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "nickname", user.getNickname(),
                "avatar", user.getAvatar(),
                "bio", user.getBio() != null ? user.getBio() : "",
                "location", user.getLocation() != null ? user.getLocation() : "",
                "createdAt", user.getCreatedAt().toString()
        ));
    }

    public ApiResponse<?> updateProfile(Long userId, java.util.Map<String, String> updates) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ApiResponse.error(404, "User not found");
        }

        if (updates.containsKey("nickname")) user.setNickname(updates.get("nickname"));
        if (updates.containsKey("bio")) user.setBio(updates.get("bio"));
        if (updates.containsKey("location")) user.setLocation(updates.get("location"));
        if (updates.containsKey("avatar")) user.setAvatar(updates.get("avatar"));

        userRepository.save(user);

        return ApiResponse.success("Update success", java.util.Map.of(
                "nickname", user.getNickname(),
                "bio", user.getBio() != null ? user.getBio() : "",
                "location", user.getLocation() != null ? user.getLocation() : "",
                "avatar", user.getAvatar(),
                "createdAt", user.getCreatedAt().toString()
        ));
    }
}