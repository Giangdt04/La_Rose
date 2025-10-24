package com.larose.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReqReviewResponse {
    private Long id;

    private Long reviewId;

    private String content;

    private LocalDateTime createdAt;
}
