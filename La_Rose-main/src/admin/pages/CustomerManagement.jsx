import React, { useState, useEffect } from "react";
import userService from "../services/user.service";

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [customerStats, setCustomerStats] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [editForm, setEditForm] = useState({
        fullName: "",
        phone: "",
        isActive: true,
        emailVerified: false,
    });
    const [createForm, setCreateForm] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
    });

    // Lấy danh sách customers
    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = searchTerm ? { search: searchTerm } : {};
            const response = await userService.getUsers(params);
            setCustomers(response || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Lỗi khi tải danh sách khách hàng",
            );
            console.error("Error fetching customers:", err);
        } finally {
            setLoading(false);
        }
    };

    // Xóa customer
    const deleteCustomer = async (customerId) => {
        try {
            const response = await userService.deleteUser(customerId);
            if (response.success) {
                setCustomers((prev) =>
                    prev.filter((customer) => customer.id !== customerId),
                );
                return response;
            }
            throw new Error(response.message || "Xóa thất bại");
        } catch (err) {
            throw err.response?.data || err;
        }
    };

    // Cập nhật customer
    const updateCustomer = async (customerId, data) => {
        try {
            const response = await userService.updateUser(customerId, data);
            if (response.success) {
                // Cập nhật local state
                setCustomers((prev) =>
                    prev.map((customer) =>
                        customer.id === customerId
                            ? { ...customer, ...data }
                            : customer,
                    ),
                );
                return response;
            }
            throw new Error(response.message || "Cập nhật thất bại");
        } catch (err) {
            throw err.response?.data || err;
        }
    };

    // Tạo customer mới (sử dụng API signup)
    const createCustomer = async (data) => {
        try {
            const response = await userService.createUser(data);
            if (response.success) {
                // Thêm vào danh sách và refresh
                fetchCustomers();
                return response;
            }
            throw new Error(response.message || "Tạo thất bại");
        } catch (err) {
            throw err.response?.data || err;
        }
    };

    // Lấy thống kê chi tiết cho customer
    const fetchCustomerStats = async (userId) => {
        try {
            setLoading(true);
            const [bookings, transactions, reviews] = await Promise.all([
                userService.getUserBookings(userId),
                userService.getUserTransactions(userId),
                userService.getUserReviews(userId),
            ]);

            const totalSpent = transactions.reduce(
                (sum, t) => sum + (t.amount || 0),
                0,
            );
            const averageRating =
                reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                      reviews.length
                    : 0;

            setCustomerStats({
                totalBookings: bookings.length || 0,
                totalTransactions: transactions.length || 0,
                totalSpent: totalSpent,
                totalReviews: reviews.length || 0,
                averageRating: averageRating,
                recentBookings: bookings.slice(0, 3),
                recentReviews: reviews.slice(0, 3),
            });
        } catch (err) {
            console.error("Error fetching customer stats:", err);
            setCustomerStats({
                totalBookings: 0,
                totalTransactions: 0,
                totalSpent: 0,
                totalReviews: 0,
                averageRating: 0,
                recentBookings: [],
                recentReviews: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
        await fetchCustomerStats(customer.id);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setEditForm({
            fullName: customer.fullName,
            phone: customer.phone,
            isActive: customer.isActive,
            emailVerified: customer.emailVerified,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            await updateCustomer(selectedCustomer.id, editForm);
            alert("Cập nhật thông tin khách hàng thành công!");
            setShowEditModal(false);
        } catch (err) {
            alert("Lỗi khi cập nhật: " + (err.message || "Lỗi không xác định"));
        }
    };

    const handleCreate = async () => {
        try {
            await createCustomer(createForm);
            alert("Tạo khách hàng mới thành công!");
            setShowCreateModal(false);
            setCreateForm({
                email: "",
                password: "",
                fullName: "",
                phone: "",
            });
        } catch (err) {
            alert(
                "Lỗi khi tạo khách hàng: " +
                    (err.message || "Lỗi không xác định"),
            );
        }
    };

    const handleDelete = async (customerId, customerName) => {
        if (
            window.confirm(`Bạn có chắc muốn xóa khách hàng "${customerName}"?`)
        ) {
            try {
                await deleteCustomer(customerId);
                alert("Xóa khách hàng thành công!");
            } catch (err) {
                alert(
                    "Lỗi khi xóa khách hàng: " +
                        (err.message || "Lỗi không xác định"),
                );
            }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCustomers();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có dữ liệu";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    // Load data khi component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    if (loading && customers.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                        Đang tải dữ liệu...
                    </span>
                </div>
            </div>
        );
    }

    if (error && customers.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-red-600 text-center p-4">
                    <div className="text-lg font-semibold mb-2">
                        Đã xảy ra lỗi
                    </div>
                    <div className="mb-4">{error}</div>
                    <button
                        onClick={fetchCustomers}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-playfair font-bold text-gray-800">
                    Quản lý khách hàng
                </h2>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                        Tổng: {customers.length} khách hàng
                    </span>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                        Thêm khách hàng
                    </button>
                    <button
                        onClick={fetchCustomers}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Tìm kiếm
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                fetchCustomers();
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Xóa
                        </button>
                    )}
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Tên
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Điện thoại
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Xác thực Email
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Trạng thái
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    {searchTerm
                                        ? "Không tìm thấy khách hàng nào phù hợp"
                                        : "Không có dữ liệu khách hàng"}
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="bg-white border-b hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-mono text-gray-600">
                                        #{customer.id}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {customer.fullName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.phone}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                customer.emailVerified
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {customer.emailVerified
                                                ? "Đã xác thực"
                                                : "Chưa xác thực"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                customer.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {customer.isActive
                                                ? "Hoạt động"
                                                : "Không hoạt động"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleViewDetails(customer)
                                                }
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition-colors"
                                            >
                                                Chi tiết
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleEdit(customer)
                                                }
                                                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs transition-colors"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        customer.id,
                                                        customer.fullName,
                                                    )
                                                }
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition-colors"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal chi tiết khách hàng */}
            {showDetailModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                Chi tiết khách hàng
                            </h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên:
                                    </label>
                                    <p className="text-gray-900 font-semibold">
                                        {selectedCustomer.fullName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email:
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedCustomer.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại:
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedCustomer.phone}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID khách hàng:
                                    </label>
                                    <p className="text-gray-900 font-mono">
                                        #{selectedCustomer.id}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái:
                                    </label>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            selectedCustomer.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {selectedCustomer.isActive
                                            ? "Hoạt động"
                                            : "Không hoạt động"}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Xác thực Email:
                                    </label>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            selectedCustomer.emailVerified
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                        }`}
                                    >
                                        {selectedCustomer.emailVerified
                                            ? "Đã xác thực"
                                            : "Chưa xác thực"}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày tham gia:
                                    </label>
                                    <p className="text-gray-900">
                                        {formatDate(selectedCustomer.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đăng nhập cuối:
                                    </label>
                                    <p className="text-gray-900">
                                        {formatDate(selectedCustomer.lastLogin)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Thống kê */}
                        <div className="border-t pt-6">
                            <h4 className="font-semibold text-lg mb-4 text-gray-800">
                                Thống kê
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {customerStats.totalBookings}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Lần đặt phòng
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                                    <div className="text-2xl font-bold text-green-600">
                                        {customerStats.totalSpent?.toLocaleString(
                                            "vi-VN",
                                        )}
                                        ₫
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Tổng chi tiêu
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {customerStats.totalReviews}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Đánh giá
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {customerStats.averageRating?.toFixed(
                                            1,
                                        )}
                                        /5
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Điểm trung bình
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Đặt phòng gần đây */}
                        {customerStats.recentBookings &&
                            customerStats.recentBookings.length > 0 && (
                                <div className="border-t pt-6">
                                    <h4 className="font-semibold text-lg mb-4 text-gray-800">
                                        Đặt phòng gần đây
                                    </h4>
                                    <div className="space-y-3">
                                        {customerStats.recentBookings.map(
                                            (booking, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {booking.roomCode}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {booking.checkIn} →{" "}
                                                            {booking.checkOut}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold">
                                                            {booking.priceTotal?.toLocaleString(
                                                                "vi-VN",
                                                            )}
                                                            ₫
                                                        </div>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded ${
                                                                booking.status ===
                                                                "confirmed"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : booking.status ===
                                                                      "completed"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {booking.status ===
                                                            "confirmed"
                                                                ? "Đã xác nhận"
                                                                : booking.status ===
                                                                  "completed"
                                                                ? "Hoàn thành"
                                                                : booking.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa khách hàng */}
            {showEditModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                Chỉnh sửa khách hàng
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            fullName: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isActive}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                isActive: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">
                                        Tài khoản hoạt động
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={editForm.emailVerified}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                emailVerified: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">
                                        Email đã xác thực
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal tạo khách hàng mới */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                Thêm khách hàng mới
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu *
                                </label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            password: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập mật khẩu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    value={createForm.fullName}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            fullName: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    value={createForm.phone}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Tạo khách hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
