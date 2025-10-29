import React, { useState, useEffect } from "react";
import roomService from "../../services/room.service";

const EditRoomModal = ({ isOpen, onClose, onEditRoom, room }) => {
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
    deleteImages: [],
  });
  const [roomTypes, setRoomTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch room types và set form data khi room thay đổi
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

  // Set form data khi room được chọn
 useEffect(() => {
  if (room) {
    setFormData({
      code: room.code || "",
      roomTypeId: room.type?.id || room.roomTypeId || "",
      title: room.title || "",
      description: room.description || "",
      capacity: room.capacity || 1,
      price: room.price || "",
      status: room.status || "available",
      amenities: {
        wifi: room.amenities?.wifi || false,
        tv: room.amenities?.tv || false,
        air_conditioner: room.amenities?.air_conditioner || false,
        bathtub: room.amenities?.bathtub || false,
      },
      deleteImages: [], // phải đúng tên
    });
    setImages(room.images || []);
  }
}, [room]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("amenities.")) {
      const amenityName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [amenityName]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseInt(value) || 0 : value,
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Lọc ra chỉ những file mới (instance of File)
    const newFiles = images.filter((img) => img instanceof File);

    const success = await onEditRoom(room.code, {
      ...formData,
      images: newFiles, // chỉ gửi file mới
    });

    if (success) {
      onClose();
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng:", error);
  } finally {
    setLoading(false);
  }
};


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Xử lý upload ảnh ở đây (có thể cần gọi API upload)
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
  const imageToRemove = images[index];
  setFormData((prev) => ({
    ...prev,
    deleteImages: [...(prev.deleteImages || []), imageToRemove.id], // thêm fallback []
  }));
  setImages((prev) => prev.filter((_, i) => i !== index));
};




  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa phòng</h3>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã phòng *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="VD: RM101"
                  readOnly
                />
              </div>

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
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
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
                  <option value="offline">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="cleaning">Đang dọn dẹp</option>
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

            {/* Amenities Section */}
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

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh phòng
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                  className="cursor-pointer text-rose-500 hover:text-rose-600 font-medium flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Thêm hình ảnh
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={
                          typeof image?.url === "string"
                            ? image.url
                            : URL.createObjectURL(image)
                        }
                        alt={`Room ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-3 h-3"
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
                  ))}
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
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;
