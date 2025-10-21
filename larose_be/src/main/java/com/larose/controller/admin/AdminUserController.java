package com.larose.controller.admin;

import com.larose.dto.*;
import com.larose.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Lấy danh sách users với phân trang và lọc
     */
    @GetMapping
    public ResponseEntity<Page<UserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean emailVerified,
            @RequestParam(required = false) String role) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserDTO> users = adminUserService.getUsersWithFilters(search, isActive, emailVerified, role, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Lấy chi tiết user
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable Long id) {
        UserDetailDTO user = adminUserService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Cập nhật user
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUpdateUserRequest request) {
        UserDTO updatedUser = adminUserService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Xóa user (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.softDeleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Gán role cho user
     */
    @PostMapping("/{id}/roles")
    public ResponseEntity<UserDTO> assignRoleToUser(@PathVariable Long id, @Valid @RequestBody AssignRoleRequest request) {
        UserDTO user = adminUserService.assignRoleToUser(id, request.getRoleName());
        return ResponseEntity.ok(user);
    }

    /**
     * Xóa role của user
     */
    @DeleteMapping("/{id}/roles/{roleName}")
    public ResponseEntity<UserDTO> removeRoleFromUser(@PathVariable Long id, @PathVariable String roleName) {
        UserDTO user = adminUserService.removeRoleFromUser(id, roleName);
        return ResponseEntity.ok(user);
    }

    /**
     * Kích hoạt user
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable Long id) {
        UserDTO user = adminUserService.activateUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Vô hiệu hóa user
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable Long id) {
        UserDTO user = adminUserService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Khôi phục user đã xóa
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<UserDTO> restoreUser(@PathVariable Long id) {
        UserDTO user = adminUserService.restoreUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Lấy thống kê users
     */
    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        UserStatsDTO stats = adminUserService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy lịch sử đăng nhập của user
     */
    @GetMapping("/{id}/login-history")
    public ResponseEntity<List<LoginHistoryDTO>> getUserLoginHistory(@PathVariable Long id) {
        List<LoginHistoryDTO> history = adminUserService.getUserLoginHistory(id);
        return ResponseEntity.ok(history);
    }
}