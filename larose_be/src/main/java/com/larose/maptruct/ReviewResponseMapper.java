package com.larose.maptruct;

import com.larose.dto.request.ReqReviewResponse;
import com.larose.dto.response.ResReviewResponse;
import com.larose.entity.ReviewResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ReviewResponseMapper {
    ReviewResponse toReviewResponse(ReqReviewResponse request);

    @Mapping(target = "responder", source = "responder")
    @Mapping(target = "review", source = "review")
    ResReviewResponse toResReviewResponse(ReviewResponse review);

}
