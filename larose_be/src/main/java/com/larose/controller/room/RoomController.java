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

    @GetMapping
    public ResponseEntity<Page<RoomResponse>> getAll(@RequestBody RoomSearchDto request){
        Page<RoomResponse> rooms = roomService.getRooms(request);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getDetail(@NonNull @PathVariable Long id){
        RoomResponse rooms = roomService.findById(id);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/types")
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomsType(){
        List<RoomTypeResponse> rooms = roomService.getRoomType();
        return ResponseEntity.ok(rooms);
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RoomResponse> create(
            @RequestParam("roomRequest") String roomRequestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws JsonProcessingException {

        RoomRequest roomRequest = new ObjectMapper().readValue(roomRequestJson, RoomRequest.class);
        RoomResponse save = roomService.create(roomRequest, images);
        return ResponseEntity.ok(save);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> update(
            @RequestParam("roomRequest") String roomRequestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws JsonProcessingException {

        RoomRequest roomRequest = new ObjectMapper().readValue(roomRequestJson, RoomRequest.class);
        RoomResponse save = roomService.update(roomRequest, images);
        return ResponseEntity.ok(save);
    }

    @DeleteMapping
    public ResponseEntity<String> delete(@RequestParam("code") String code) {
        roomService.delete(code);
        return ResponseEntity.ok("Xóa thành công");
    }




}
