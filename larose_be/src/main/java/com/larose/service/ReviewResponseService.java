package com.larose.service;

import com.larose.config.JwtTokenUtil;
import com.larose.dto.request.ReqReviewResponse;
import com.larose.dto.response.ResReviewResponse;
import com.larose.entity.Review;
import com.larose.entity.ReviewResponse;
import com.larose.maptruct.ReviewResponseMapper;
import com.larose.repository.ReviewRepository;
import com.larose.repository.ReviewResponseRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewResponseService {
    private final ReviewRepository reviewRepository;
    private final ReviewResponseRepository reviewResponseRepository;
    private final UserService userService;
    private final ReviewResponseMapper responseMapper;
    private final JwtTokenUtil jwtTokenUtil;

    public String getEmailFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenUtil.getEmailFromToken(token);
        }
        throw new IllegalArgumentException("No JWT token found in request");
    }

    @Transactional
    public ResReviewResponse create(ReqReviewResponse request, HttpServletRequest httpRequest) {
        ReviewResponse reviewResponse = responseMapper.toReviewResponse(request);

        reviewResponse.setResponder(userService.findByEmailAndActive(this.getEmailFromRequest(httpRequest)));

        Review review = reviewRepository.findById(request.getReviewId())
                        .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        reviewResponse.setReview(review);

        reviewResponse.setCreatedAt(LocalDateTime.now());

        reviewResponseRepository.save(reviewResponse);

        review.setStatus(Review.ReviewStatus.published);

        reviewRepository.save(review);

        return responseMapper.toResReviewResponse(reviewResponse);
    }

    @Transactional
    public ResReviewResponse update(ReqReviewResponse request) {
        ReviewResponse reviewResponse = reviewResponseRepository.findById(request.getId())
                .orElseThrow(() -> new IllegalArgumentException("Review response not found"));
        reviewResponse.setContent(request.getContent());

        reviewResponseRepository.save(reviewResponse);

        return responseMapper.toResReviewResponse(reviewResponse);
    }

    @Transactional
    public void delete(Long id) {
        ReviewResponse delete = reviewResponseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review response not found"));
        reviewResponseRepository.delete(delete);
    }

}
