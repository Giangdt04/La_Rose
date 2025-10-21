package com.larose.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupResponse {
    private String message;
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime timestamp;

    public SignupResponse(String message, Long userId, String email, String fullName, String phone, LocalDateTime createdAt) {
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.createdAt = createdAt;
        this.timestamp = LocalDateTime.now();
    }
}