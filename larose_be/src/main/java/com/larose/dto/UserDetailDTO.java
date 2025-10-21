package com.larose.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserDetailDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Boolean isActive;
    private Boolean emailVerified;
    private LocalDateTime emailVerifiedAt;
    private String oauthProvider;
    private String oauthProviderId;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private Set<String> roles;
    private Integer totalBookings;
    private Integer totalReviews;
}