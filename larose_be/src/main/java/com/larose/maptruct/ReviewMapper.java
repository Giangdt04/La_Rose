package com.larose.maptruct;

import com.larose.dto.ReviewDTO;
import com.larose.entity.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    ReviewDTO toDTO(Review review);

    Review toReview(ReviewDTO reviewDTO);
}
