package com.larose.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private Byte rating;
    private String title;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin booking liên quan
    private Long bookingId;
    private String bookingCode;

    // Thông tin phòng
    private Long roomId;
    private String roomCode;
    private String roomTitle;

    // Thông tin user
    private Long userId;
    private String userEmail;
    private String userFullName;
}