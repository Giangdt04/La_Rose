package com.larose.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomTypeResponse {
    private Long id;
    private String name;
    private String shortDescription;
    private Integer maxGuests;
    private BigDecimal basePrice;
}
