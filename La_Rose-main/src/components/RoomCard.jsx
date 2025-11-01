// RoomCard.jsx
import React, { useState } from "react";

const RoomCard = ({ room, primaryImageUrl, onBookNow }) => {
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Hàm xử lý lỗi ảnh
    const handleImageError = (e) => {
        e.target.src = "/default-room-image.jpg";
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return price?.toLocaleString("vi-VN") || "0";
    };
const parseAmenities = (amenities) => {
  if (!amenities) return [];

  let parsed = {};
  try {
    // Nếu amenities là string → parse JSON
    if (typeof amenities === "string") {
      parsed = JSON.parse(amenities);
    } else if (typeof amenities === "object") {
      parsed = amenities;
    }
  } catch (e) {
    console.warn("Invalid amenities format:", amenities);
    return [];
  }

  const list = [];
  if (parsed.wifi) list.push("WiFi");
  if (parsed.tv) list.push("TV");
  if (parsed.air_conditioner) list.push("Điều hòa");
  if (parsed.bathtub) list.push("Bồn tắm");
  // Thêm tiện nghi khác nếu có
  return list;
};
    // Lấy trạng thái phòng
    const getStatusInfo = (status) => {
        switch (status) {
            case "available":
                return {
                    text: "Có sẵn",
                    class: "bg-green-100 text-green-800 border border-green-200",
                };
            case "offline":
                return {
                    text: "Đã đặt",
                    class: "bg-red-100 text-red-800 border border-red-200",
                };
            case "maintenance":
                return {
                    text: "Bảo trì",
                    class: "bg-yellow-100 text-yellow-800 border border-yellow-200",
                };
            default:
                return {
                    text: "Không xác định",
                    class: "bg-gray-100 text-gray-800 border border-gray-200",
                };
        }
    };

    // Lấy icon cho loại phòng
    const getRoomTypeIcon = (roomType) => {
        const typeName = roomType?.name?.toLowerCase() || "";

        switch (typeName) {
            case "standard":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                );
            case "deluxe":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                    </svg>
                );
            case "suite":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                );
            case "family":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                );
            case "executive":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                );
            case "studio":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                );
            case "apartment":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                );
            case "accessible":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                    </svg>
                );
            case "honeymoon":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                );
        }
    };

    // Lấy gradient background dựa trên loại phòng
    const getRoomGradient = (roomType) => {
        const typeName = roomType?.name?.toLowerCase() || "";

        switch (typeName) {
            case "standard":
                return "from-blue-50 to-blue-100";
            case "deluxe":
                return "from-purple-50 to-purple-100";
            case "suite":
                return "from-amber-50 to-amber-100";
            case "family":
                return "from-green-50 to-green-100";
            case "executive":
                return "from-gray-50 to-gray-100";
            case "studio":
                return "from-pink-50 to-pink-100";
            case "apartment":
                return "from-indigo-50 to-indigo-100";
            case "accessible":
                return "from-teal-50 to-teal-100";
            case "honeymoon":
                return "from-rose-50 to-rose-100";
            default:
                return "from-gray-50 to-gray-100";
        }
    };

    // Kiểm tra xem phòng có ảnh không
    const hasImages = room.images && room.images.length > 0;
    const displayImageUrl = primaryImageUrl || "/default-room-image.jpg";
    const gradientClass = getRoomGradient(room.roomType);

    const statusInfo = getStatusInfo(room.status);

    // Xử lý click nút đặt phòng - luôn cho phép vì filtered available
    const handleBookClick = (e) => {
        e.preventDefault();
        if (onBookNow) {
            onBookNow(room);
        }
    };

    // Xử lý click xem chi tiết
    const handleViewDetail = (e) => {
        e.preventDefault();
        setShowDetailPopup(true);
        setCurrentImageIndex(0); // Reset về ảnh đầu tiên khi mở popup
    };

    // Xử lý chuyển ảnh
    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === room.images.length - 1 ? 0 : prevIndex + 1,
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? room.images.length - 1 : prevIndex - 1,
        );
    };

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    // Hiển thị thông tin chi tiết phòng
    const renderRoomDetails = () => {
        const details = [];

        // Mã phòng
        if (room.code) {
            details.push(
                <div
                    key="code"
                    className="flex items-center gap-2 text-sm text-gray-600"
                >
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    <span>Mã: {room.code}</span>
                </div>,
            );
        }

        // Diện tích (ước tính dựa trên loại phòng nếu không có từ DB)
        const getEstimatedArea = (roomType) => {
            const typeName = roomType?.name?.toLowerCase() || "";
            switch (typeName) {
                case "standard":
                    return "25-30";
                case "deluxe":
                    return "35-40";
                case "suite":
                    return "45-50";
                case "family":
                    return "40-45";
                case "executive":
                    return "35-40";
                case "studio":
                    return "30-35";
                case "apartment":
                    return "50-60";
                case "accessible":
                    return "30-35";
                case "honeymoon":
                    return "40-45";
                default:
                    return "25-30";
            }
        };

        details.push(
            <div
                key="area"
                className="flex items-center gap-2 text-sm text-gray-600"
            >
                <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                </svg>
                <span>Diện tích: {room.area || getEstimatedArea(room.roomType)} m²</span>
            </div>,
        );

        // Sức chứa (ước tính nếu không có từ DB)
        const getEstimatedCapacity = (roomType) => {
            const typeName = roomType?.name?.toLowerCase() || "";
            switch (typeName) {
                case "standard":
                    return 2;
                case "deluxe":
                    return 2;
                case "suite":
                    return 3;
                case "family":
                    return 4;
                case "executive":
                    return 2;
                case "studio":
                    return 2;
                case "apartment":
                    return 4;
                case "accessible":
                    return 2;
                case "honeymoon":
                    return 2;
                default:
                    return 2;
            }
        };

        details.push(
            <div
                key="capacity"
                className="flex items-center gap-2 text-sm text-gray-600"
            >
                <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                <span>Sức chứa: {room.capacity || getEstimatedCapacity(room.roomType)} người</span>
            </div>,
        );

        return details;
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col border border-gray-200">
                {/* Image Section */}
                <div className="h-48 overflow-hidden relative">
                    {hasImages ? (
                        <img
                            src={displayImageUrl}
                            alt={room.title || "Phòng khách sạn"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={handleImageError}
                            loading="lazy"
                        />
                    ) : (
                        <div
                            className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
                        >
                            <div className="text-center text-gray-600">
                                <div className="w-16 h-16 mx-auto mb-3 bg-white/50 rounded-full flex items-center justify-center">
                                    {getRoomTypeIcon(room.roomType)}
                                </div>
                                <p className="text-sm font-medium">
                                    Không có ảnh
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Ảnh sẽ được cập nhật
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}
                        >
                            {statusInfo.text}
                        </span>
                    </div>

                    {/* Room Type Badge với Icon */}
                    {room.roomType?.name && (
                        <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 border border-gray-300 flex items-center gap-1">
                                {getRoomTypeIcon(room.roomType)}
                                {room.roomType.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {room.title || "Chưa có tên"}
                    </h3>

                    {/* Mô tả ngắn từ type */}
                    {room.roomType?.shortDescription && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {room.roomType.shortDescription}
                        </p>
                    )}

                    {/* Mô tả phòng */}
                    {room.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {room.description}
                        </p>
                    )}

                    {/* Thông tin chi tiết */}
                    <div className="space-y-2 mb-4 flex-1">
                        {renderRoomDetails()}
                    </div>

                    {/* Price and Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-auto">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-rose-600">
                                {formatPrice(room.price)} VND
                            </span>
                            <span className="text-xs text-gray-500">/đêm</span>
                        </div>

                        <div className="flex gap-2">
                            {/* Nút Xem chi tiết */}
                            <button
                                onClick={handleViewDetail}
                                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                Chi tiết
                            </button>

                            {/* Nút Đặt phòng */}
                            <button
                                onClick={handleBookClick}
                                className="bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Đặt ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Popup */}
            {showDetailPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {room.title || "Chi tiết phòng"}
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        {room.roomType?.name} • Mã: {room.code}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailPopup(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
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

                            {/* Image Gallery Section */}
                            <div className="mb-6">
                                {hasImages ? (
                                    <div className="space-y-4">
                                        {/* Main Image */}
                                        <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={
                                                    room.images[
                                                        currentImageIndex
                                                    ]?.url
                                                }
                                                alt={`${room.title} - Ảnh ${
                                                    currentImageIndex + 1
                                                }`}
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />

                                            {/* Navigation Arrows - chỉ hiển thị khi có nhiều hơn 1 ảnh */}
                                            {room.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={
                                                            handlePrevImage
                                                        }
                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M15 19l-7-7 7-7"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleNextImage
                                                        }
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}

                                            {/* Image Counter */}
                                            {room.images.length > 1 && (
                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                    {currentImageIndex + 1} /{" "}
                                                    {room.images.length}
                                                </div>
                                            )}
                                        </div>

                                        {/* Thumbnail Gallery - chỉ hiển thị khi có nhiều hơn 1 ảnh */}
                                        {room.images.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {room.images.map(
                                                    (image, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                handleThumbnailClick(
                                                                    index,
                                                                )
                                                            }
                                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                                                index ===
                                                                currentImageIndex
                                                                    ? "border-rose-500 ring-2 ring-rose-200"
                                                                    : "border-gray-300 hover:border-gray-400"
                                                            }`}
                                                        >
                                                            <img
                                                                src={image?.url}
                                                                alt={`${
                                                                    room.title
                                                                } - Ảnh ${
                                                                    index + 1
                                                                }`}
                                                                className="w-full h-full object-cover"
                                                                onError={
                                                                    handleImageError
                                                                }
                                                            />
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className={`w-full h-64 bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center`}
                                    >
                                        <div className="text-center text-gray-600">
                                            <div className="w-20 h-20 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
                                                {getRoomTypeIcon(room.roomType)}
                                            </div>
                                            <p className="text-lg font-medium">
                                                Không có ảnh
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Ảnh sẽ được cập nhật sau
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thông tin chi tiết */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            Thông tin cơ bản
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Loại phòng:
                                                </span>
                                                <span className="font-medium">
                                                    {room.roomType?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Mã phòng:
                                                </span>
                                                <span className="font-medium">
                                                    {room.code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Trạng thái:
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}
                                                >
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Diện tích:
                                                </span>
                                                <span className="font-medium">
                                                    {(() => {
                                                        const typeName =
                                                            room.roomType?.name?.toLowerCase() ||
                                                            "";
                                                        switch (typeName) {
                                                            case "standard":
                                                                return "25-30 m²";
                                                            case "deluxe":
                                                                return "35-40 m²";
                                                            case "suite":
                                                                return "45-50 m²";
                                                            case "family":
                                                                return "40-45 m²";
                                                            case "executive":
                                                                return "35-40 m²";
                                                            case "studio":
                                                                return "30-35 m²";
                                                            case "apartment":
                                                                return "50-60 m²";
                                                            case "accessible":
                                                                return "30-35 m²";
                                                            case "honeymoon":
                                                                return "40-45 m²";
                                                            default:
                                                                return "25-30 m²";
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Sức chứa:
                                                </span>
                                                <span className="font-medium">
                                                   {room.capacity || getEstimatedCapacity(room.roomType)} người
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            Giá & Đặt phòng
                                        </h4>
                                        <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-rose-600 mb-2">
                                                    {formatPrice(room.price)}{" "}
                                                    VND
                                                </div>
                                                <p className="text-gray-600 text-sm">
                                                    /đêm (chưa bao gồm thuế &
                                                    phí)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {room.roomType?.shortDescription && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                Mô tả
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                {room.roomType.shortDescription}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mô tả chi tiết */}
                            {room.description && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        Thông tin bổ sung
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {room.description}
                                    </p>
                                </div>
                            )}

                       {/* Tiện nghi phòng */}
<div className="mb-6">
  <h4 className="font-semibold text-gray-900 mb-3">Tiện nghi phòng</h4>
  {(() => {
    const amenityList = parseAmenities(room.amenities);
    return amenityList.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {amenityList.map((name, idx) => (
          <div key={idx} className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {name}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600 text-sm">Không có tiện nghi.</p>
    );
  })()}
</div>
                            {/* Footer với nút hành động */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailPopup(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={(e) => {
                                        setShowDetailPopup(false);
                                        handleBookClick(e);
                                    }}
                                    className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-medium"
                                >
                                    Đặt Phòng Ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoomCard;