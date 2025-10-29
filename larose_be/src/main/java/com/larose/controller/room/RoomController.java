package com.larose.controller.room;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.larose.dto.request.RoomRequest;
import com.larose.dto.response.RoomResponse;
import com.larose.dto.response.RoomTypeResponse;
import com.larose.dto.search.RoomSearchDto;
import com.larose.service.RoomService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<Page<RoomResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Long typeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        RoomSearchDto searchDto = new RoomSearchDto();
        searchDto.setKeyword(keyword);
        searchDto.setMinPrice(minPrice);
        searchDto.setMaxPrice(maxPrice);
        searchDto.setTypeId(typeId);
        searchDto.setPageIndex(page);
        searchDto.setPageSize(size);

        Page<RoomResponse> rooms = roomService.getRooms(searchDto);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getDetail(@NonNull @PathVariable Long id){
        RoomResponse rooms = roomService.findById(id);
        return ResponseEntity.ok(rooms);
    }

    // ✅ GET /api/rooms/types
    @GetMapping("/types")
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomTypes() {
        return ResponseEntity.ok(roomService.getRoomType());
    }

    // ✅ POST /api/rooms  → tạo mới
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RoomResponse> create(
            @RequestParam("roomRequest") String roomRequestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws JsonProcessingException {

        RoomRequest roomRequest = objectMapper.readValue(roomRequestJson, RoomRequest.class);
        RoomResponse savedRoom = roomService.create(roomRequest, images);
        return ResponseEntity.status(201).body(savedRoom);
    }

    // ✅ PUT /api/rooms/{code}  → cập nhật
    @PutMapping(value = "/{code}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> update(
            @PathVariable String code,
            @RequestParam("roomRequest") String roomRequestJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) throws JsonProcessingException {
        System.out.println(roomRequestJson);
        RoomRequest roomRequest = objectMapper.readValue(roomRequestJson, RoomRequest.class);
        roomRequest.setCode(code); // đảm bảo code khớp
        RoomResponse updated = roomService.update(roomRequest, images);
        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE /api/rooms/{code}
    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        roomService.delete(code);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
