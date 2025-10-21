package com.larose.dto;

import lombok.Data;

@Data
public class UserStatsDTO {
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long verifiedUsers;
    private Long unverifiedUsers;
    private Long deletedUsers;
    private Long todayRegistrations;
    private Long weekRegistrations;
    private Long monthRegistrations;
}