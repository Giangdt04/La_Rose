import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import roomService from "../services/room.service";

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: "",
        minPrice: "",
        maxPrice: "",
    });

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(18);

    const navigate = useNavigate();

    // Fetch rooms từ API với phân trang
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await roomService.getAllRooms({
                    page: currentPage,
                    size: pageSize,
                });
                console.log(response);
                setRooms(response.content || []);
                setFilteredRooms(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError(
                    "Không thể tải danh sách phòng. Vui lòng thử lại sau.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [currentPage, pageSize]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Áp dụng filters client-side
    const applyFilters = () => {
        let tempRooms = [...rooms];

        // Filter theo loại phòng
        if (filters.type) {
            tempRooms = tempRooms.filter(
                (room) =>
                    room.type?.name?.toLowerCase() ===
                    filters.type.toLowerCase(),
            );
        }

        // Filter theo giá tối thiểu
        if (filters.minPrice) {
            tempRooms = tempRooms.filter(
                (room) => room.price >= parseInt(filters.minPrice),
            );
        }

        // Filter theo giá tối đa
        if (filters.maxPrice) {
            tempRooms = tempRooms.filter(
                (room) => room.price <= parseInt(filters.maxPrice),
            );
        }

        setFilteredRooms(tempRooms);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, rooms]);

    // Search rooms từ server (tùy chọn) - có phân trang
    const handleSearchFromServer = async () => {
        try {
            setLoading(true);
            const searchFilters = {
                ...filters,
                page: currentPage,
                size: pageSize,
            };

            const response = await roomService.searchRooms(searchFilters);
            setFilteredRooms(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.error("Error searching rooms:", err);
            setError("Không thể tìm kiếm phòng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Reset filters và phân trang
    const handleResetFilters = () => {
        setFilters({
            type: "",
            minPrice: "",
            maxPrice: "",
        });
        setCurrentPage(0);
        setFilteredRooms(rooms);
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Xử lý thay đổi số lượng item mỗi trang
    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        setCurrentPage(0);
    };

    // Hàm xử lý đặt phòng - chuyển hướng đến booking page với dữ liệu phòng
    const handleBookRoom = (room) => {
        // Chuẩn bị dữ liệu để truyền sang booking page
        const bookingData = {
            roomId: room.id,
            roomType: room.type?.name || room.title,
            roomNumber: room.roomNumber || room.number,
            price: room.price,
            roomTitle: room.title,
            roomDescription: room.description,
            roomArea: room.area,
            roomCapacity: room.capacity,
            roomImages: room.images,
            status: room.status,
        };

        // Chuyển hướng đến booking page với state
        navigate("/booking", {
            state: {
                preFilledData: bookingData,
                fromRoomPage: true,
            },
        });
    };

    // Tạo danh sách số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            0,
            currentPage - Math.floor(maxVisiblePages / 2),
        );
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">
                        Đang tải danh sách phòng...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <h2 className="font-playfair text-4xl font-bold text-center text-gray-800 mb-12">
                Danh sách phòng
            </h2>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại phòng
                        </label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                        >
                            <option value="">Tất cả</option>
                            <option value="standard">
                                Phòng tiêu chuẩn (Standard)
                            </option>
                            <option value="deluxe">
                                Phòng cao cấp (Deluxe)
                            </option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá từ
                        </label>
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="0"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá đến
                        </label>
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="10,000,000"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleResetFilters}
                            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                        >
                            Đặt lại
                        </button>
                        <button
                            onClick={handleSearchFromServer}
                            className="flex-1 bg-rose-600 text-white py-3 px-4 rounded-lg hover:bg-rose-700 transition-colors duration-200 font-medium"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Room Count và Page Size Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="text-gray-600 text-sm sm:text-base">
                    Hiển thị {filteredRooms.length} phòng trên tổng số{" "}
                    {totalElements} phòng
                    {filters.type && ` - Loại: ${filters.type}`}
                    {filters.minPrice &&
                        ` - Giá từ: ${parseInt(
                            filters.minPrice,
                        ).toLocaleString()} VND`}
                    {filters.maxPrice &&
                        ` - Đến: ${parseInt(
                            filters.maxPrice,
                        ).toLocaleString()} VND`}
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Hiển thị:</label>
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
                    <span className="text-sm text-gray-600">phòng/trang</span>
                </div>
            </div>

            {/* Room List */}
            {filteredRooms.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredRooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                primaryImageUrl={
                                    room.images?.find((img) => img.isPrimary)
                                        ?.url || room.images?.[0]?.url
                                }
                                onBookNow={() => handleBookRoom(room)}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(0)}
                                disabled={currentPage === 0}
                                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    currentPage === 0
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                «
                            </button>

                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 0}
                                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    currentPage === 0
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                ‹
                            </button>

                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                        currentPage === pageNum
                                            ? "bg-rose-600 text-white"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNum + 1}
                                </button>
                            ))}

                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages - 1}
                                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    currentPage === totalPages - 1
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                ›
                            </button>

                            <button
                                onClick={() => handlePageChange(totalPages - 1)}
                                disabled={currentPage === totalPages - 1}
                                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    currentPage === totalPages - 1
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                »
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">
                        Không tìm thấy phòng phù hợp với tiêu chí tìm kiếm.
                    </p>
                    <button
                        onClick={handleResetFilters}
                        className="bg-rose-600 text-white py-2 px-6 rounded-lg hover:bg-rose-700 transition-colors duration-200 font-medium"
                    >
                        Hiển thị tất cả phòng
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomsPage;
