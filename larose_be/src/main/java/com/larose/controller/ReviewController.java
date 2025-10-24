package com.larose.controller;

import com.larose.dto.ReviewDTO;
import com.larose.dto.request.ReqReviewResponse;
import com.larose.dto.response.ResReviewResponse;
import com.larose.service.ReviewResponseService;
import com.larose.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {
    private final ReviewService reviewService;
    private final ReviewResponseService reviewResponseService;

    @PostMapping("/response")
    public ResponseEntity<ResReviewResponse> createResponse(@Valid @RequestBody ReqReviewResponse reqReviewResponse, HttpServletRequest request) {
        ResReviewResponse response = reviewResponseService.create(reqReviewResponse, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/response")
    public ResponseEntity<ResReviewResponse> updateResponse(@Valid @RequestBody ReqReviewResponse reqReviewResponse) {
        ResReviewResponse response = reviewResponseService.update(reqReviewResponse);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/response/{id}")
    public ResponseEntity<String> deleteResponse(@Valid @PathVariable Long id) {
        reviewResponseService.delete(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> create(@Valid @RequestBody ReviewDTO reviewDTO, HttpServletRequest request) {
        ReviewDTO response = reviewService.create(reviewDTO, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ReviewDTO> update(@Valid @RequestBody ReviewDTO reviewDTO) {
        ReviewDTO response = reviewService.update(reviewDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@Valid @PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}
