package com.larose.service;

import com.larose.dto.projection.RoomsProjection;
import com.larose.dto.request.RoomRequest;
import com.larose.dto.response.RoomImageResponse;
import com.larose.dto.response.RoomResponse;
import com.larose.dto.response.RoomTypeResponse;
import com.larose.dto.search.RoomSearchDto;
import com.larose.entity.Room;
import com.larose.entity.RoomImage;
import com.larose.entity.RoomType;
import com.larose.maptruct.RoomMapper;
import com.larose.repository.RoomImageRepository;
import com.larose.repository.RoomRepository;
import com.larose.repository.RoomTypeRepository;
import com.larose.util.FileUploadUtil;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;

    RoomImageRepository roomImageRepository;

    RoomTypeRepository roomTypeRepository;

    RoomMapper roomMapper;

    FileUploadUtil fileUploadUtil;

    public Page<RoomResponse> getRooms(@NonNull RoomSearchDto request) {

        Pageable pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize());

        Page<RoomsProjection> roomPage = roomRepository.getRooms(request, pageable);

        return mapProjectionToRoomResponse(roomPage, pageable);
    }

    public RoomResponse findById(Long id){
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not found room with id: " + id));
        return roomMapper.toResponse(room);
    }

    public List<RoomTypeResponse> getRoomType() {
        List<RoomType> getAll = roomTypeRepository.findAll();
        return getAll.stream()
                .map(this::mapProjectionToRoomResponse)
                .collect(Collectors.toList());
    }

    public Room getRoom(String code) {
        return roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + code));

    }

    @Transactional
    public RoomResponse create(RoomRequest request, List<MultipartFile> images){
        Room room = roomMapper.toEntity(request);

        Room genCode = roomRepository.getTop1();

        if (genCode == null) {
            room.setCode("RM1");
        } else {
            String code = genCode.getCode();
            room.setCode(code.substring(0, 2) + ((Integer.parseInt(code.substring(2))) + 1));
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Room type not found with id: " + request.getRoomTypeId()));
        room.setRoomType(roomType);

        room = roomRepository.save(room);

        uploadImagesAsync(room, images, null);

        return roomMapper.toResponse(room);
    }

    @Transactional
    public RoomResponse update(RoomRequest request, List<MultipartFile> images){
        Room room = roomRepository.findByCode(request.getCode())
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + request.getCode()));

        roomMapper.update(room, request);

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Room type not found with id: " + request.getRoomTypeId()));
        room.setRoomType(roomType);

        room = roomRepository.save(room);

        uploadImagesAsync(room, images, request.getDeleteImages());

        return roomMapper.toResponse(room);
    }

    public void delete(String code) {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + code));

        room.setDeletedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    @Async
    public void uploadImagesAsync(Room room, List<MultipartFile> newImages, List<Long> deleteImageIds){
        if(deleteImageIds != null && !deleteImageIds.isEmpty()){
            roomImageRepository.deleteAllById(deleteImageIds);
        }

        if(newImages == null || newImages.isEmpty()) return;

        List<RoomImage> existingImages = roomImageRepository.findByRoomId(room.getId());
        boolean hasPrimary = existingImages.stream().anyMatch(RoomImage::getIsPrimary);

        List<RoomImage> imgs = new ArrayList<>();
        for (int i = 0; i < newImages.size(); i++) {
            MultipartFile file = newImages.get(i);
            if(file.isEmpty()) continue;

            String url = fileUploadUtil.uploadFile(file);

            RoomImage img = new RoomImage();
            img.setRoom(room);
            img.setUrl(url);
            img.setIsPrimary(!hasPrimary && i == 0); // ảnh đầu tiên nếu chưa có chính
            imgs.add(img);
        }

        roomImageRepository.saveAll(imgs);
    }

    private RoomTypeResponse mapProjectionToRoomResponse(RoomType roomType) {
        RoomTypeResponse response = new RoomTypeResponse();
        response.setId(roomType.getId());
        response.setName(roomType.getName());
        response.setShortDescription(roomType.getShortDescription());
        response.setMaxGuests(roomType.getMaxGuests());
        response.setBasePrice(roomType.getBasePrice());
        return response;
    }

    private Page<RoomResponse> mapProjectionToRoomResponse(Page<RoomsProjection> roomPage, Pageable pageable) {
        Map<Long, RoomResponse> roomMap = new LinkedHashMap<>();

        for (RoomsProjection r : roomPage.getContent()) {
            RoomResponse room = roomMap.computeIfAbsent(r.getRoomId(), id -> RoomResponse.builder()
                    .id(r.getRoomId())
                    .code(r.getRoomCode())
                    .title(r.getRoomTitle())
                    .price(r.getRoomPrice())
                    .status(r.getRoomStatus())
                    .description(r.getRoomDescription())
                    .createdAt(r.getRoomCreatedAt())
                    .updatedAt(r.getRoomUpdatedAt())
                    .deletedAt(r.getRoomDeletedAt())
                    .type(RoomTypeResponse.builder()
                            .id(r.getTypeId())
                            .name(r.getTypeName())
                            .basePrice(r.getBasePrice())
                            .shortDescription(r.getTypeShortDescription())
                            .build())
                    .images(new ArrayList<>())
                    .build()
            );

            if (r.getImageId() != null) {
                room.getImages().add(RoomImageResponse.builder()
                        .id(r.getImageId())
                        .url(r.getImageUrl())
                        .isPrimary(r.getImageIsPrimary())
                        .url(r.getImageUrl())
                        .build());
            }
        }

        List<RoomResponse> responses = new ArrayList<>(roomMap.values());
        return new PageImpl<>(responses, pageable, roomPage.getTotalElements());
    }
}
