// src/pages/HistoryBookingPage.jsx
import React, { useState, useEffect } from 'react';
import bookingService from '../services/booking.service'; // Đã import đúng service của user

const HistoryBookingPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0); // 0-indexed
    const [totalPages, setTotalPages] = useState(0);
    const [cancelLoading, setCancelLoading] = useState({});

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page: page,
                size: 20,
            };
            
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await bookingService.getHistoryBookings(params);
            setBookings(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Lỗi khi tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, statusFilter]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setCancelLoading(prev => ({ ...prev, [bookingId]: true }));
        try {
            await bookingService.cancelBooking(bookingId);
            setBookings(prev =>
                prev.map(b =>
                    b.id === bookingId ? { ...b, status: 'cancelled' } : b
                )
            );
            alert('Hủy phòng thành công!');
        } catch (err) {
            console.error('Lỗi khi hủy phòng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể hủy phòng';
            alert('Lỗi: ' + msg);
        } finally {
            setCancelLoading(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        // Code này chỉ format số, không tính toán
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'confirmed': 'Đã xác nhận',
            'checked_in': 'Đã nhận phòng',
            'checked_out': 'Đã trả phòng',
            'cancelled': 'Đã hủy',
            'no_show': 'Không đến'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'checked_in': 'bg-blue-100 text-blue-800',
            'checked_out': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800',
            'no_show': 'bg-orange-100 text-orange-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    const canCancel = (status) => {
        return status === 'pending' || status === 'confirmed';
    };

    // ✅ SỬA: Thêm hàm xử lý chuyển trang
    const handlePageChange = (newPage) => {
        // newPage là 0-indexed
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    // ✅ SỬA: Thêm hàm render các nút số trang
    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        const currentPage = page; // 0-indexed
        const total = totalPages;

        // Luôn hiển thị trang đầu
        pageNumbers.push(0);

        // Các trang xung quanh trang hiện tại
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(total - 2, currentPage + 1);
        
        // Dấu "..." bên trái
        if (startPage > 1) {
            pageNumbers.push('...');
        }

        // Các trang ở giữa
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Dấu "..." bên phải
        if (endPage < total - 2) {
            pageNumbers.push('...');
        }

        // Luôn hiển thị trang cuối (nếu tổng số trang > 1)
        if (total > 1) {
            pageNumbers.push(total - 1);
        }

        // Lọc các trang trùng lặp (ví dụ: nếu totalPages = 3)
        const uniquePages = [...new Set(pageNumbers)];

        return uniquePages.map((p, index) => (
            <button
                key={index}
                onClick={() => (typeof p === 'number' ? handlePageChange(p) : null)}
                disabled={p === '...'}
                className={`px-4 py-2 border rounded ${
                    p === currentPage
                        ? 'bg-blue-600 text-white font-bold' // Trang hiện tại
                        : 'bg-white text-gray-700'
                } ${
                    p === '...' 
                        ? 'cursor-default' 
                        : 'hover:bg-gray-100'
                }`}
            >
                {/* Hiển thị số trang (1-indexed) */}
                {typeof p === 'number' ? p + 1 : p}
            </button>
        ));
    };


    if (loading && bookings.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-playfair font-bold text-gray-800">Lịch sử đặt phòng</h2>
                <div className="flex items-center gap-4">
                    <select 
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0); // Reset về trang 0 khi đổi filter
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="checked_in">Đã nhận phòng</option>
                        <option value="checked_out">Đã trả phòng</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Mã đơn</th>
                            <th scope="col" className="px-6 py-3">Khách hàng</th>
                            <th scope="col" className="px-6 py-3">Phòng</th>
                            <th scope="col" className="px-6 py-3">Ngày</th>
                            <th scope="col" className="px-6 py-3">Số đêm</th>
                            <th scope="col" className="px-6 py-3">Tổng tiền</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                    Không có đơn đặt phòng nào
                                </td>
                            </tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-blue-600">{booking.bookingCode}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {booking.userFullName || 'N/A'}
                                        {booking.userEmail && (
                                            <div className="text-xs text-gray-500">{booking.userEmail}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.roomTitle && (
                                            <div className="text-xs text-gray-500">{booking.roomTitle}</div>
                                        )}
                                        {!booking.roomTitle && booking.roomTypeName && (
                                            <div className="text-xs text-gray-500">{booking.roomTypeName}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{formatDate(booking.checkIn)}</div>
                                        <div className="text-xs text-gray-500">đến {formatDate(booking.checkOut)}</div>
                                    </td>
                                    <td className="px-6 py-4">{booking.nights} đêm</td>
                                    {/* Chỗ này chỉ hiển thị, không tính toán */}
                                    <td className="px-6 py-4 font-semibold">{formatCurrency(booking.priceTotal)}₫</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {canCancel(booking.status) ? (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                disabled={cancelLoading[booking.id]}
                                                className={`px-3 py-1 text-xs rounded ${
                                                    cancelLoading[booking.id]
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                            >
                                                {cancelLoading[booking.id] ? 'Đang hủy...' : 'Hủy phòng'}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ SỬA: Cập nhật lại khu vực phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trước
                    </button>
                    
                    {renderPaginationNumbers()}

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default HistoryBookingPage;