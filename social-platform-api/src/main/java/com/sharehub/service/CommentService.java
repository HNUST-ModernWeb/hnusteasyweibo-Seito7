package com.sharehub.service;

import com.sharehub.dto.ApiResponse;
import com.sharehub.entity.Comment;
import com.sharehub.entity.Post;
import com.sharehub.entity.User;
import com.sharehub.repository.CommentRepository;
import com.sharehub.repository.PostRepository;
import com.sharehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse<?> addComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            return ApiResponse.error(404, "Post not found");
        }

        User author = userRepository.findById(userId).orElse(null);
        if (author == null) {
            return ApiResponse.error(404, "User not found");
        }

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .author(author)
                .build();

        commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return ApiResponse.success("Comment added", toCommentMap(comment));
    }

    @Transactional
    public ApiResponse<?> deleteComment(Long commentId, Long userId, Long postId) {
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) {
            return ApiResponse.error(404, "Comment not found");
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            return ApiResponse.error(403, "Permission denied");
        }

        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
            postRepository.save(post);
        }

        commentRepository.delete(comment);
        return ApiResponse.success("Comment deleted", null);
    }

    public ApiResponse<?> getComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            return ApiResponse.error(404, "Post not found");
        }

        List<Map<String, Object>> comments = commentRepository
                .findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toCommentMap)
                .collect(Collectors.toList());

        return ApiResponse.success(comments);
    }

    private Map<String, Object> toCommentMap(Comment c) {
        return Map.of(
                "id", c.getId(),
                "content", c.getContent(),
                "createdAt", c.getCreatedAt().toString(),
                "author", Map.of(
                        "id", c.getAuthor().getId(),
                        "username", c.getAuthor().getUsername(),
                        "nickname", c.getAuthor().getNickname(),
                        "avatar", c.getAuthor().getAvatar()
                )
        );
    }
}