package com.larose.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomImageResponse {
    private Long id;
    private Boolean isPrimary;
    private String url;
    private Integer sortOrder;
}
