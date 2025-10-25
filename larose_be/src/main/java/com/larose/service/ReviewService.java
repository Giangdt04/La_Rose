package com.larose.service;

import com.larose.config.JwtTokenUtil;
import com.larose.dto.ReviewDTO;
import com.larose.entity.Booking;
import com.larose.entity.Review;
import com.larose.entity.Room;
import com.larose.entity.User;
import com.larose.maptruct.ReviewMapper;
import com.larose.repository.BookingRepository;
import com.larose.repository.ReviewRepository;
import com.larose.repository.RoomRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final ReviewMapper reviewMapper;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final JwtTokenUtil jwtTokenUtil;

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

    public User getMyInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Object principal = auth.getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        } else {
            throw new IllegalArgumentException("Cannot extract email from principal");
        }

        return userService.findByEmailAndActive(email);
    }


    @Transactional
    public ReviewDTO create(ReviewDTO request, HttpServletRequest httpRequest) {
        Review review = reviewMapper.toReview(request);

        review.setUser(this.getMyInfo());

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        review.setBooking(booking);

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        review.setRoom(room);

        reviewRepository.save(review);

        return this.convertToReviewDTO(review);
    }

    @Transactional
    public ReviewDTO update(ReviewDTO request) {
        Review review = reviewRepository.findById(request.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setRating(request.getRating());
        review.setUpdatedAt(LocalDateTime.now());
        review.setContent(request.getContent());

        reviewRepository.save(review);

        return this.convertToReviewDTO(review);
    }

    @Transactional
    public void delete(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        reviewRepository.delete(review);
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