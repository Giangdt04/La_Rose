package com.larose.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {
    private String code;
    private Long roomTypeId;
    private String title;
    private String description;
    private Integer capacity;
    private BigDecimal price;
    private String status;
    private Map<String,Object> amenities;
    private List<Long> deleteImages;

}
