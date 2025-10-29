import session from "../../utils/SessionManager";

const API_BASE_URL = "http://localhost:8080/api";
const roomService = {
  getAuthHeaders() {
    const token = session.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
  async handleResponse(response) {
    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Có lỗi xảy ra");
    }
  },
  async getRooms(page = 0, size = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/rooms?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng");
      throw error;
    }
  },
  async addRoom(roomData) {
    try {
      const token = session.getToken();
      const formData = new FormData();

      formData.append(
        "roomRequest",
        JSON.stringify({
          code: roomData.code,
          roomTypeId: roomData.roomTypeId,
          title: roomData.title,
          description: roomData.description,
          capacity: roomData.capacity,
          price: roomData.price,
          status: roomData.status,
          amenities: roomData.amenities || {},
        })
      );

      if (roomData.images) {
        roomData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi thêm phòng");
      throw error;
    }
  },
  async deleteRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return await this.handleResponse(response);
      }
    } catch (error) {
      console.error("Lỗi khi xóa phòng");
      throw error;
    }
  },
  async getRoomTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/types`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tải danh sách loại phòng");
      throw error;
    }
  },
  async updateRoom(roomId, roomData) {
    try {
      console.log(roomData);
      const token = session.getToken();
      const formData = new FormData();

      formData.append(
        "roomRequest",
        JSON.stringify({
          code: roomData.code,
          roomTypeId: roomData.roomTypeId,
          title: roomData.title,
          description: roomData.description,
          capacity: roomData.capacity,
          price: roomData.price,
          status: roomData.status,
          amenities: roomData.amenities || {},
          deleteImages: roomData.deleteImages || [],
        })
      );

      if (roomData.images) {
        roomData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng");
      throw error;
    }
  },
  async getRoomById(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tải thông tin phòng");
      throw error;
    }
  },
};

export default roomService;
