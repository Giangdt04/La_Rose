import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import roomService from "../services/room.service";
import AddRoomModal from "../components/room/AddRoomModal";
import EditRoomModal from "../components/room/EditRoomModal";
import RoomDetailModal from "../components/room/RoomDetailModal";
import DeleteConfirmationModal from "../components/room/DeleteConfirmationModal";
import StatusChangeModal from "../components/room/StatusChangeModal";
import {
    Building,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Plus,
    Trash,
    User,
} from "lucide-react";

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [statusChangeData, setStatusChangeData] = useState({
        room: null,
        newStatus: "",
        oldStatus: "",
    });
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(18);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch rooms từ service
    const fetchRooms = async (page = 0, showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const response = await roomService.getRooms(page, pageSize);

            // Xử lý response đơn giản
            const content = response.content || [];
            const totalPagesValue = response.totalPages || 1;
            const totalElementsValue = response.totalElements || 0;

            setRooms(content);
            setTotalPages(totalPagesValue);
            setTotalElements(totalElementsValue);
        } catch (error) {
            console.error("❌ Lỗi khi tải danh sách phòng:", error);
            toast.error("Không thể tải danh sách phòng");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // Chỉ fetch rooms khi component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    // Hàm thêm phòng mới
    const handleAddRoom = async (roomData) => {
        try {
            await roomService.addRoom(roomData);
            toast.success("Thêm phòng thành công");
            fetchRooms(currentPage, false);
            return true;
        } catch (error) {
            console.error("Lỗi khi thêm phòng:", error);
            toast.error("Không thể thêm phòng");
            return false;
        }
    };

    // Hàm chỉnh sửa phòng
    const handleEditRoom = async (roomId, roomData) => {
        try {
            await roomService.updateRoom(roomId, roomData);
            toast.success("Cập nhật phòng thành công");
            fetchRooms(currentPage, false);
            return true;
        } catch (error) {
            console.error("Lỗi khi cập nhật phòng:", error);
            toast.error("Không thể cập nhật phòng");
            return false;
        }
    };

    // Hàm xóa phòng
    const handleDeleteRoom = async (roomId) => {
        try {
            await roomService.deleteRoom(roomId);
            toast.success("Xóa phòng thành công");

            // Xử lý phân trang sau khi xóa
            if (rooms.length === 1 && currentPage > 0) {
                fetchRooms(currentPage - 1, false);
            } else {
                fetchRooms(currentPage, false);
            }
        } catch (error) {
            console.error("Lỗi khi xóa phòng:", error);
            toast.error("Không thể xóa phòng");
        }
    };

    // Hàm thay đổi trạng thái phòng
    const handleChangeStatus = async (roomId, newStatus) => {
        try {
            await roomService.updateRoomStatus(roomId, newStatus);
            toast.success("Cập nhật trạng thái thành công");
            fetchRooms(currentPage, false);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    // Xử lý mở modal chỉnh sửa
    const handleEdit = (room) => {
        setSelectedRoom(room);
        setEditModalOpen(true);
    };

    // Xử lý mở modal chi tiết
    const handleViewDetail = (room) => {
        setSelectedRoom(room);
        setDetailModalOpen(true);
    };

    // Xử lý mở modal xác nhận xóa
    const handleDelete = (room) => {
        setRoomToDelete(room);
        setDeleteModalOpen(true);
    };

    // Xử lý xác nhận xóa
    const handleConfirmDelete = () => {
        if (roomToDelete) {
            handleDeleteRoom(roomToDelete.code);
            setDeleteModalOpen(false);
            setRoomToDelete(null);
        }
    };

    // Xử lý hủy xóa
    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setRoomToDelete(null);
    };

    // Xử lý xác nhận thay đổi trạng thái
    const handleConfirmStatusChange = () => {
        if (statusChangeData.room && statusChangeData.newStatus) {
            handleChangeStatus(
                statusChangeData.room.id,
                statusChangeData.newStatus,
            );
            setStatusModalOpen(false);
            setStatusChangeData({
                room: null,
                newStatus: "",
                oldStatus: "",
            });
        }
    };

    // Xử lý hủy thay đổi trạng thái
    const handleCancelStatusChange = () => {
        setStatusModalOpen(false);
        setStatusChangeData({
            room: null,
            newStatus: "",
            oldStatus: "",
        });
    };

    // Thêm useEffect để theo dõi currentPage
    useEffect(() => {
        fetchRooms(currentPage, true);
    }, [currentPage, pageSize]);
    
    // Sửa lại handlePageChange
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Tối ưu hiển thị phân trang - SỬ DỤNG CÁC STATE ĐỘC LẬP
    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const pages = [];
        pages.push(0);

        if (currentPage > 2) pages.push("...");

        const start = Math.max(1, currentPage - 1);
        const end = Math.min(totalPages - 2, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 3) pages.push("...");
        if (totalPages > 1) pages.push(totalPages - 1);

        return pages;
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Chuyển đổi status
    const getStatusText = (status) => {
        const statusMap = {
            available: "Trống",
            occupied: "Đã đặt",
            maintenance: "Bảo trì",
            cleaning: "Đang dọn dẹp",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            available: "text-green-600 bg-green-100",
            occupied: "text-blue-600 bg-blue-100",
            maintenance: "text-yellow-600 bg-yellow-100",
            cleaning: "text-purple-600 bg-purple-100",
        };
        return statusColors[status] || "text-gray-600 bg-gray-100";
    };

    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        setCurrentPage(0);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Quản lý phòng
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Tổng số: {totalElements} phòng - Trang{" "}
                            {currentPage + 1} / {totalPages}
                        </p>
                    </div>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm phòng
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Mã phòng
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Tên phòng
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Loại phòng
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Giá
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Sức chứa
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Trạng thái
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                >
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Building className="w-16 h-16 text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-gray-400">
                                                Không có dữ liệu phòng
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rooms.map((room) => (
                                    <tr
                                        key={room.id}
                                        className="bg-white border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <button
                                                onClick={() =>
                                                    handleViewDetail(room)
                                                }
                                                className="text-rose-500 hover:text-rose-700 font-mono font-bold text-lg transition-colors"
                                            >
                                                {room.code}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {room.title}
                                                </div>
                                                {room.description && (
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                                        {room.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="font-medium text-gray-900">
                                                    {room.type?.name || "N/A"}
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    {room.type
                                                        ?.shortDescription ||
                                                        ""}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {formatPrice(room.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-400 mr-1" />
                                                {room.capacity} người
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusText(room.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewDetail(room)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(room)
                                                    }
                                                    className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(room)
                                                    }
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-6 py-3 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                    <span className="text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">
                                Hiển thị:
                            </label>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm"
                            >
                                <option value={9}>9</option>
                                <option value={18}>18</option>
                                <option value={36}>36</option>
                                <option value={54}>54</option>
                            </select>
                            <span className="text-sm text-gray-600">
                                phòng/trang trong tổng số {totalElements} phòng
                            </span>
                        </div>
                    </span>

                    {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                            {/* Nút Trước */}
                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 0}
                                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Trước
                            </button>

                            {/* Các nút trang */}
                            <div className="flex space-x-1">
                                {getVisiblePages().map((page, index) =>
                                    page === "..." ? (
                                        <span
                                            key={`dots-${index}`}
                                            className="px-3 py-2 text-sm text-gray-500"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            key={page}
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] ${
                                                currentPage === page
                                                    ? "bg-rose-500 text-white border border-rose-500"
                                                    : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                                            }`}
                                        >
                                            {page + 1}
                                        </button>
                                    ),
                                )}
                            </div>

                            {/* Nút Sau */}
                            <button
                                type="button"
                                onClick={() => {
                                    handlePageChange(currentPage + 1);
                                }}
                                disabled={currentPage === totalPages - 1}
                                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                Sau
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <AddRoomModal
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    onAddRoom={handleAddRoom}
                />
            )}

            {isEditModalOpen && selectedRoom && (
                <EditRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onEditRoom={handleEditRoom}
                    room={selectedRoom}
                />
            )}

            {isDetailModalOpen && selectedRoom && (
                <RoomDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    room={selectedRoom}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Xác nhận xóa phòng"
                    message={
                        roomToDelete
                            ? `Bạn có chắc chắn muốn xóa phòng "${roomToDelete.title}" (${roomToDelete.code}) không? Hành động này không thể hoàn tác.`
                            : ""
                    }
                    confirmText="Xóa"
                    cancelText="Hủy"
                />
            )}

            {isStatusModalOpen && statusChangeData.room && (
                <StatusChangeModal
                    isOpen={isStatusModalOpen}
                    onClose={handleCancelStatusChange}
                    onConfirm={handleConfirmStatusChange}
                    room={statusChangeData.room}
                    oldStatus={statusChangeData.oldStatus}
                    newStatus={statusChangeData.newStatus}
                    getStatusText={getStatusText}
                    getStatusColor={getStatusColor}
                />
            )}
        </>
    );
};

export default RoomManagement;
