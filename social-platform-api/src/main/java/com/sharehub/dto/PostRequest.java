package com.sharehub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class PostRequest {
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 2000, message = "Content must be 1-2000 characters")
    private String content;

    private List<String> images;

    @NotBlank(message = "Visibility is required")
    private String visibility = "public";
}