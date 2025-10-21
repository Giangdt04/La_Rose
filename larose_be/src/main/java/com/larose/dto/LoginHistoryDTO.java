package com.larose.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LoginHistoryDTO {
    private LocalDateTime loginTime;
    private String ipAddress;
    private String userAgent;
    private String location;
}