package com.larose.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueDto(LocalDate date, BigDecimal revenue) {}