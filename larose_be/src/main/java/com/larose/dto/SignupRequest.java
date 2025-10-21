package com.larose.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
    private String fullName;
    private String phone;
}
