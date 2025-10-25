import React from "react";

const StatusChangeModal = ({
    isOpen,
    onClose,
    onConfirm,
    room,
    oldStatus,
    newStatus,
    getStatusText,
    getStatusColor,
    loading = false,
}) => {
    if (!isOpen || !room) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    {/* Icon Info */}
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-4">
                        Xác nhận thay đổi trạng thái
                    </h3>

                    {/* Room Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                {room.title}
                            </div>
                            <div className="text-sm text-gray-600 font-mono">
                                {room.code}
                            </div>
                        </div>
                    </div>

                    {/* Status Change */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-center">
                            <div
                                className={`px-3 py-2 rounded-lg ${getStatusColor(
                                    oldStatus,
                                )} font-medium`}
                            >
                                {getStatusText(oldStatus)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Trạng thái hiện tại
                            </div>
                        </div>

                        <div className="mx-4">
                            <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </div>

                        <div className="text-center">
                            <div
                                className={`px-3 py-2 rounded-lg ${getStatusColor(
                                    newStatus,
                                )} font-medium`}
                            >
                                {getStatusText(newStatus)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Trạng thái mới
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                            <svg
                                className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                            <p className="text-sm text-yellow-700">
                                Thay đổi trạng thái có thể ảnh hưởng đến khả
                                năng đặt phòng và các thao tác khác.
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                "Xác nhận"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeModal;
