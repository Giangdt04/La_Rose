package com.larose.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.larose.dto.ReviewDTO;
import com.larose.dto.UserDTO;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResReviewResponse {
    private Long id;

    private ReviewDTO review;

    private UserDTO responder;

    private String content;

    private LocalDateTime createdAt;
}
