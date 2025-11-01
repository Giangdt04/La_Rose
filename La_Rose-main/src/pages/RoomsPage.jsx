// src/pages/RoomsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import roomService from "../services/room.service";

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        keyword: "",
        typeId: "",
        priceRange: "",
        capacity: "",
    });

    const [appliedFilters, setAppliedFilters] = useState({
        keyword: "",
        typeId: "",
        priceRange: "",
        capacity: "",
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(18);

    const navigate = useNavigate();

    // Lấy loại phòng
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const types = await roomService.getAllRoomTypes();
                setRoomTypes(types || []);
            } catch (err) {
                setError("Không thể tải danh sách loại phòng.");
                console.error("Error fetching room types:", err);
            }
        };
        fetchRoomTypes();
    }, []);

    // Lấy phòng
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                setError(null);

                // Parse priceRange
                let minPrice, maxPrice;
                if (appliedFilters.priceRange) {
                    if (appliedFilters.priceRange === "10000000-") {
                        minPrice = 10000000;
                    } else {
                        const [min, max] = appliedFilters.priceRange.split("-").map(Number);
                        minPrice = min;
                        maxPrice = max;
                    }
                }

                // Parse capacity — chỉ gửi nếu có giá trị hợp lệ
                const capacity = appliedFilters.capacity
                    ? Number(appliedFilters.capacity)
                    : undefined;

                // ✅ TẠO PARAMS CHUẨN
                const params = {};
                if (appliedFilters.keyword) params.keyword = appliedFilters.keyword;
                if (minPrice !== undefined) params.minPrice = minPrice;
                if (maxPrice !== undefined) params.maxPrice = maxPrice;
                if (appliedFilters.typeId) params.typeId = appliedFilters.typeId;
                if (capacity !== undefined && !isNaN(capacity)) params.capacity = capacity;
                params.page = currentPage;
                params.size = pageSize;

                const response = await roomService.getAllRooms(params);
                setRooms(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [currentPage, pageSize, appliedFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchFromServer = () => {
        setAppliedFilters({ ...filters });
        setCurrentPage(0);
    };

    const handleResetFilters = () => {
        const resetFilters = {
            keyword: "",
            typeId: "",
            priceRange: "",
            capacity: "",
        };
        setFilters(resetFilters);
        setAppliedFilters(resetFilters);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleBookRoom = (room) => {
        const bookingData = {
            roomId: room.id,
            roomType: room.roomType?.name || room.title,
            roomNumber: room.code,
            price: room.price || room.roomType?.basePrice,
            roomTitle: room.title,
            roomDescription: room.description,
            roomCapacity: room.capacity || room.roomType?.maxGuests || 2,
            roomImages: room.images,
            status: room.status,
        };

        navigate("/booking", {
            state: {
                preFilledData: bookingData,
                fromRoomPage: true,
            },
        });
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    if (loading && rooms.length === 0) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Đang tải danh sách phòng...</div>
                </div>
            </div>
        );
    }

    if (error && rooms.length === 0) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <h2 className="font-playfair text-4xl font-bold text-center text-gray-800 mb-12">
                Khám Phá Không Gian Nghỉ Dưỡng
            </h2>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-12 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1 xl:col-span-1">
                        <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                            Từ khóa
                        </label>
                        <input
                            type="text"
                            name="keyword"
                            id="keyword"
                            value={filters.keyword}
                            onChange={handleFilterChange}
                            placeholder="Tên phòng, mã phòng..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                    </div>

                    <div className="lg:col-span-1 xl:col-span-1">
                        <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-1">
                            Loại phòng
                        </label>
                        <select
                            name="typeId"
                            id="typeId"
                            value={filters.typeId}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                        >
                            <option value="">Tất cả</option>
                            {roomTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="lg:col-span-1 xl:col-span-1">
                        <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                            Khoảng giá
                        </label>
                        <select
                            name="priceRange"
                            id="priceRange"
                            value={filters.priceRange}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                        >
                            <option value="">Tất cả mức giá</option>
                            <option value="0-1000000">Dưới 1 triệu</option>
                            <option value="1000000-2000000">1 – 2 triệu</option>
                            <option value="2000000-5000000">2 – 5 triệu</option>
                            <option value="5000000-10000000">5 – 10 triệu</option>
                            <option value="10000000-">Trên 10 triệu</option>
                        </select>
                    </div>

                    <div className="lg:col-span-1 xl:col-span-1">
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                            Số người
                        </label>
                        <select
                            name="capacity"
                            id="capacity"
                            value={filters.capacity}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                        >
                            <option value="">Tất cả</option>
                            <option value="1">1 người</option>
                            <option value="2">2 người</option>
                            <option value="3">3 người</option>
                            <option value="4">3 người</option>
                            <option value="5">5 người</option>
                            <option value="6">6 người</option>

                        </select>
                    </div>

                    <div className="flex gap-2 items-center justify-start lg:col-span-1 xl:col-span-1 lg:mt-6 xl:mt-0">
                        <button
                            onClick={handleSearchFromServer}
                            className="flex-1 w-full bg-rose-600 text-white py-2 px-5 rounded-lg hover:bg-rose-700 transition-colors duration-200 font-medium"
                        >
                            Tìm Kiếm
                        </button>
                        <button
                            onClick={handleResetFilters}
                            title="Xóa bộ lọc"
                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {rooms.length > 0 ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-gray-700">
                            Hiển thị <b>{rooms.length}</b> trong tổng số <b>{totalElements}</b> kết quả
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                primaryImageUrl={
                                    room.images?.find((img) => img.isPrimary)?.url || room.images?.[0]?.url
                                }
                                onBookNow={() => handleBookRoom(room)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
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
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    currentPage === 0
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                ‹
                            </button>

                            {getPageNumbers().map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                        currentPage === pageNumber
                                            ? "bg-rose-600 text-white font-medium shadow"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
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