package com.sharehub.repository;

import com.sharehub.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByVisibility(String visibility, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.visibility = 'public' " +
           "OR (p.visibility = 'friends' AND (p.author.id = :userId " +
           "OR p.author.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId)))")
    Page<Post> findVisiblePosts(@Param("userId") Long userId, Pageable pageable);

    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    Page<Post> findByAuthorId(Long authorId, Pageable pageable);
}