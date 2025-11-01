package com.larose.dto;

import java.math.BigDecimal;

public record OccupancyRateDto(Long bookedRooms, Long totalRooms, BigDecimal occupancyRatePercent) {}