package com.larose.maptruct;


import com.larose.dto.request.RoomRequest;
import com.larose.dto.response.RoomResponse;
import com.larose.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    Room toEntity(RoomRequest request);

    RoomResponse toResponse(Room room);

    void update(@MappingTarget Room room, RoomRequest request);

}
