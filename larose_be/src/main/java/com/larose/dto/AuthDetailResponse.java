package com.larose.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AuthDetailResponse extends AuthResponse {
    private UserInfoResponse userInfo;
    private String message;

    public AuthDetailResponse(String accessToken, String refreshToken, String tokenType, Long userId,
                              UserInfoResponse userInfo, String message) {
        super(accessToken, refreshToken, tokenType, userId);
        this.userInfo = userInfo;
        this.message = message;
    }
}
