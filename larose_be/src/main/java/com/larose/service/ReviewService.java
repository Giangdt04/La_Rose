package com.larose.service;

import com.larose.dto.ReviewDTO;
import com.larose.entity.Review;
import com.larose.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;

    public List<ReviewDTO> getUserReviews(String email, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return reviews.stream()
                .map(this::convertToReviewDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getUserReviewsByStatus(String email, String status, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        try {
            Review.ReviewStatus reviewStatus = Review.ReviewStatus.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<Review> reviews = reviewRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), reviewStatus, pageable);

            return reviews.stream()
                    .map(this::convertToReviewDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    private ReviewDTO convertToReviewDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        dto.setStatus(review.getStatus().name());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());

        // Thông tin booking
        if (review.getBooking() != null) {
            dto.setBookingId(review.getBooking().getId());
            dto.setBookingCode(review.getBooking().getBookingCode());
        }

        // Thông tin phòng
        if (review.getRoom() != null) {
            dto.setRoomId(review.getRoom().getId());
            dto.setRoomCode(review.getRoom().getCode());
            dto.setRoomTitle(review.getRoom().getTitle());
        }

        // Thông tin user
        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUserEmail(review.getUser().getEmail());
            dto.setUserFullName(review.getUser().getFullName());
        }

        return dto;
    }
}