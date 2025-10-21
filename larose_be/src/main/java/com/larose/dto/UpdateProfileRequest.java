package com.larose.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 200, message = "Họ và tên không được vượt quá 200 ký tự")
    private String fullName;

    @Size(max = 30, message = "Số điện thoại không được vượt quá 30 ký tự")
    private String phone;
}