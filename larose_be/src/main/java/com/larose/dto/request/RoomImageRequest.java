package com.larose.dto.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomImageRequest {
    private MultipartFile imageFile;
    private Boolean isPrimary;
    private String url;
    private Integer sortOrder;
}
