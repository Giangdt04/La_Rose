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
import org.springframework.util.CollectionUtils;
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

        Pageable pageable = PageRequest.of(request.getPageIndex() , request.getPageSize());

        Page<RoomsProjection> roomPage = roomRepository.getRooms(request, pageable);

        List<Long> roomIds = roomPage.stream()
                .map(RoomsProjection::getRoomId)
                .toList();

        List<RoomImage> images = roomImageRepository.findAllByRoomIdIn(roomIds);

        Map<Long, List<RoomImageResponse>> imagesMap = images.stream()
                .map(img -> RoomImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .isPrimary(img.getIsPrimary())
                        .roomId(img.getRoom().getId())
                        .build())
                .collect(Collectors.groupingBy(RoomImageResponse::getRoomId));


        List<RoomResponse> responses = roomPage.stream()
                .map(r -> RoomResponse.fromProjection(r, imagesMap.getOrDefault(r.getRoomId(), new ArrayList<>())))
                .toList();

        return new PageImpl<>(responses, pageable, roomPage.getTotalElements());
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
        if(!CollectionUtils.isEmpty(request.getDeleteImages())){
            List<RoomImage> deleteList = roomImageRepository.findAllByIdIn(request.getDeleteImages());
            for(RoomImage deletes : deleteList){
                room.getImages().remove(deletes);
                if(deletes.getIsPrimary() && room.getImages().size() > 0){
                    room.getImages().get(0).setIsPrimary(true);
                }
            }
        }
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


        if(CollectionUtils.isEmpty(newImages)) return;

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
}
