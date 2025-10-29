-- Script để cập nhật bookings có user_id và tạo bookings mới với thông tin khách hàng
-- Chạy script này trong MySQL để có dữ liệu test đầy đủ

-- Cập nhật các bookings hiện có với user_id
UPDATE bookings SET user_id = 5 WHERE id IN (3, 4, 5);
UPDATE bookings SET user_id = 6 WHERE id IN (6, 7, 8);
UPDATE bookings SET user_id = 4 WHERE id IN (9, 10, 11);

-- Hoặc insert thêm bookings mới có đầy đủ thông tin
INSERT INTO `bookings` 
(`booking_code`, `user_id`, `room_id`, `room_type_id`, `check_in`, `check_out`, `nights`, `guests`, `price_total`, `deposit_amount`, `status`, `created_at`, `updated_at`)
VALUES 
('BK14', 5, 7, 1, '2025-11-01', '2025-11-03', 2, 2, 900000.00, 300000.00, 'pending', NOW(), NOW()),
('BK15', 6, 9, 2, '2025-11-05', '2025-11-08', 3, 3, 2100000.00, 700000.00, 'confirmed', NOW(), NOW()),
('BK16', 4, 10, 2, '2025-11-10', '2025-11-12', 2, 2, 1400000.00, 500000.00, 'confirmed', NOW(), NOW()),
('BK17', 5, 11, 3, '2025-11-15', '2025-11-18', 3, 4, 3600000.00, 1200000.00, 'checked_in', NOW(), NOW()),
('BK18', 6, 12, 3, '2025-11-20', '2025-11-22', 2, 5, 2400000.00, 800000.00, 'pending', NOW(), NOW());

-- Insert thêm transactions tương ứng cho các bookings mới
INSERT INTO `transactions` 
(`booking_id`, `user_id`, `provider`, `provider_transaction_id`, `amount`, `currency`, `status`, `type`, `created_at`, `updated_at`)
SELECT 
    b.id, 
    b.user_id, 
    'VNPAY', 
    CONCAT('TXN', LPAD(b.id, 6, '0')), 
    b.price_total, 
    'VND', 
    'success', 
    'payment',
    NOW(),
    NOW()
FROM bookings b 
WHERE b.booking_code IN ('BK14', 'BK15', 'BK16', 'BK17', 'BK18');

