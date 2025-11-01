// /src/components/AddRoomModal.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, Trash2, Loader } from "lucide-react";
import roomService from "../../services/room.service";

const AddRoomModal = ({ isOpen, onClose, onAddRoom }) => {
    const [formData, setFormData] = useState({
        code: "",
        roomTypeId: "",
        title: "",
        description: "",
        capacity: 1,
        price: "",
        status: "available",
        amenities: {
            wifi: false,
            tv: false,
            air_conditioner: false,
            bathtub: false,
        },
    });
    const [roomTypes, setRoomTypes] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const types = await roomService.getRoomTypes();
                setRoomTypes(types);
            } catch (error) {
                console.error("Lỗi khi tải loại phòng:", error);
            }
        };

        if (isOpen) {
            fetchRoomTypes();
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith("amenities.")) {
            const amenityKey = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                amenities: {
                    ...prev.amenities,
                    [amenityKey]: checked,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? (value === "" ? 0 : parseInt(value)) : value,
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gửi amenities dưới dạng object thuần — BE sẽ tự JSON.stringify
            const roomData = {
                ...formData,
                // Đảm bảo capacity và price là số
                capacity: Number(formData.capacity),
                price: Number(formData.price),
                amenities: { ...formData.amenities }, // plain object
                images: images,
            };

            const success = await onAddRoom(roomData);

            if (success) {
                setFormData({
                    code: "",
                    roomTypeId: "",
                    title: "",
                    description: "",
                    capacity: 1,
                    price: "",
                    status: "available",
                    amenities: {
                        wifi: false,
                        tv: false,
                        air_conditioner: false,
                        bathtub: false,
                    },
                });
                setImages([]);
                onClose();
            }
        } catch (error) {
            console.error("Lỗi khi thêm phòng:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                            Thêm phòng mới
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                            type="button"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại phòng *
                                </label>
                                <select
                                    name="roomTypeId"
                                    value={formData.roomTypeId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                >
                                    <option value="">Chọn loại phòng</option>
                                    {roomTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Tên phòng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sức chứa *
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá phòng *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                >
                                    <option value="available">Có sẵn</option>
                                    <option value="maintenance">Bảo trì</option>
                                    <option value="offline">Đang dọn dẹp</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                placeholder="Mô tả về phòng..."
                            />
                        </div>

                        {/* Amenities Section — ĐÃ CHUẨN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiện nghi
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="amenities.wifi"
                                        checked={formData.amenities.wifi}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                                    />
                                    <span className="text-sm text-gray-700">WiFi</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="amenities.tv"
                                        checked={formData.amenities.tv}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                                    />
                                    <span className="text-sm text-gray-700">TV</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="amenities.air_conditioner"
                                        checked={formData.amenities.air_conditioner}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                                    />
                                    <span className="text-sm text-gray-700">Điều hòa</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="amenities.bathtub"
                                        checked={formData.amenities.bathtub}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                                    />
                                    <span className="text-sm text-gray-700">Bồn tắm</span>
                                </label>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hình ảnh phòng
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center justify-center"
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-rose-500 hover:text-rose-600 font-medium">
                                        Chọn hình ảnh
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        PNG, JPG, JPEG (tối đa 10MB)
                                    </span>
                                </label>
                            </div>

                            {images.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Ảnh đã chọn ({images.length})
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {images.map((image, index) => (
                                            <div
                                                key={index}
                                                className="relative group rounded-lg overflow-hidden border border-gray-200"
                                            >
                                                <img
                                                    src={typeof image === "string" ? image : URL.createObjectURL(image)}
                                                    alt={`Room ${index + 1}`}
                                                    className="w-full h-24 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center min-w-[120px]"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin w-4 h-4 mr-2" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm phòng"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddRoomModal;