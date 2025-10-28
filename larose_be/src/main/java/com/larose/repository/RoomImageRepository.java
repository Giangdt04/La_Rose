package com.larose.repository;

import com.larose.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoomId(Long roomId);

    List<RoomImage> findAllByRoomIdIn(List<Long> roomIds);
}
