package com.larose.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    @Email
    private String email;

    @Size(max = 200)
    private String fullName;

    @Size(max = 30)
    private String phone;

    private Boolean isActive;
    private Boolean emailVerified;
}