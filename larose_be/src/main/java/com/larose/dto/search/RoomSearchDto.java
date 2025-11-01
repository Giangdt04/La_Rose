package com.larose.dto.search;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomSearchDto extends SearchDto {
    private Double minPrice;
    private Double maxPrice;
    private Long typeId;
    private String keyword;
    private Integer capacity; 
}
