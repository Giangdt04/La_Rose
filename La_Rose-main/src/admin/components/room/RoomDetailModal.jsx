// src/components/RoomDetailModal.jsx
import React from "react";

const RoomDetailModal = ({ isOpen, onClose, room }) => {
    if (!isOpen || !room) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getStatusText = (status) => {
        const statusMap = {
            available: "Trống",
            offline: "Đã đặt",
            maintenance: "Bảo trì",
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const statusClasses = {
            available: "bg-green-100 text-green-800",
            offline: "bg-blue-100 text-blue-800",
            maintenance: "bg-yellow-100 text-yellow-800",
            cleaning: "bg-purple-100 text-purple-800",
        };
        return statusClasses[status] || "bg-gray-100 text-gray-800";
    };

    // ✅ amenities là object thuần từ BE → không cần parse
    const amenities = room.amenities || {};

    // ✅ capacity là số nguyên → hiển thị trực tiếp
    const displayCapacity = room.capacity && room.capacity > 0 
        ? `${room.capacity} người` 
        : "2 người";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                            Chi tiết phòng
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                            type="button"
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
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã phòng
                                </label>
                                <p className="text-lg font-mono font-bold text-rose-500">
                                    {room.code}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <span
                                    className={`px-3 py-1 text-sm rounded-full ${getStatusClass(
                                        room.status,
                                    )}`}
                                >
                                    {getStatusText(room.status)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên phòng
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {room.title}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại phòng
                                </label>
                                <p className="text-gray-900">
                                    {room.roomType?.name || room.type?.name || "N/A"}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá phòng
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {formatPrice(room.price)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sức chứa
                                </label>
                                <p className="text-gray-900">{displayCapacity}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {room.description && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {room.description}
                                </p>
                            </div>
                        )}

                        {/* Amenities — HIỂN THỊ ĐÚNG TỪ CSDL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiện nghi
                            </label>
                            {(() => {
                                const hasAny = amenities.wifi || amenities.tv || amenities.air_conditioner || amenities.bathtub;
                                if (!hasAny) {
                                    return <p className="text-gray-500 text-sm">Không có tiện nghi.</p>;
                                }
                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {amenities.wifi && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                                </svg>
                                                <span className="text-sm">WiFi</span>
                                            </div>
                                        )}
                                        {amenities.tv && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm">TV</span>
                                            </div>
                                        )}
                                        {amenities.air_conditioner && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                </svg>
                                                <span className="text-sm">Điều hòa</span>
                                            </div>
                                        )}
                                        {amenities.bathtub && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                                <span className="text-sm">Bồn tắm</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Images */}
                        {room.images && room.images.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hình ảnh
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {room.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image.url}
                                            alt={`Room ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailModal;