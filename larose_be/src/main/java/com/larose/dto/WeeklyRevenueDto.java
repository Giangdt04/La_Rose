package com.larose.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklyRevenueDto(Integer weekNumber, LocalDate startDate, LocalDate endDate, BigDecimal revenue) {}