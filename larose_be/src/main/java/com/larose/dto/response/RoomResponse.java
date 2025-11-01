package com.larose.dto.response;

import com.larose.dto.projection.RoomsProjection;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    private Long id;
    private String code;
    private String title;
    private BigDecimal price;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
    private LocalDateTime updatedAt;
    private String description;
    private Integer capacity;
    private Map<String, Object> amenities; // 👈 Vẫn giữ nguyên kiểu Map

    private RoomTypeResponse type;
    private List<RoomImageResponse> images = new ArrayList<>();

    // ✅ SỬA: Thêm tham số amenities đã được parse
    public static RoomResponse fromProjection(RoomsProjection r, Map<String, Object> amenities, List<RoomImageResponse> images) {
        return RoomResponse.builder()
                .id(r.getRoomId())
                .code(r.getRoomCode())
                .title(r.getRoomTitle())
                .price(r.getRoomPrice())
                .status(r.getRoomStatus())
                .description(r.getRoomDescription())
                .createdAt(r.getRoomCreatedAt())
                .updatedAt(r.getRoomUpdatedAt())
                .deletedAt(r.getRoomDeletedAt())
                .capacity(r.getRoomCapacity())
                .amenities(amenities) // 👈 ĐÃ LÀ MAP
                .type(RoomTypeResponse.builder()
                        .id(r.getTypeId())
                        .name(r.getTypeName())
                        .basePrice(r.getBasePrice())
                        .shortDescription(r.getTypeShortDescription())
                        .build())
                .images(images != null ? images : new ArrayList<>())
                .build();
    }
}