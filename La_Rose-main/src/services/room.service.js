import HttpService from "./http.service";

class RoomService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/rooms";
  }

  async getAllRooms(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) {
        queryParams.append("page", params.page);
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size);
      }

      if (params.status) {
        queryParams.append("status", params.status);
      }
      if (params.type) {
        queryParams.append("type", params.type);
      }
      if (params.search) {
        queryParams.append("search", params.search);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.basePath}?${queryString}`
        : this.basePath;

      return await this.httpService.get(url);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  }

  async getRoomById(roomId) {
    try {
      return await this.httpService.get(`${this.basePath}/${roomId}`);
    } catch (error) {
      console.error(`Error fetching room ${roomId}:`, error);
      throw error;
    }
  }

  async createRoom(roomData) {
    try {
      return await this.httpService.post(this.basePath, roomData);
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  async updateRoom(roomId, roomData) {
    try {
      return await this.httpService.put(`${this.basePath}/${roomId}`, roomData);
    } catch (error) {
      console.error(`Error updating room ${roomId}:`, error);
      throw error;
    }
  }

  async patchRoom(roomId, roomData) {
    try {
      return await this.httpService.patch(
        `${this.basePath}/${roomId}`,
        roomData
      );
    } catch (error) {
      console.error(`Error patching room ${roomId}:`, error);
      throw error;
    }
  }

  async deleteRoom(roomId) {
    try {
      return await this.httpService.delete(`${this.basePath}/${roomId}`);
    } catch (error) {
      console.error(`Error deleting room ${roomId}:`, error);
      throw error;
    }
  }

  async getAvailableRooms(params = {}) {
    return await this.getAllRooms({ ...params, status: "available" });
  }

  async searchRooms(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ""
        ) {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.basePath}/search?${queryString}`
        : `${this.basePath}/search`;

      return await this.httpService.get(url);
    } catch (error) {
      console.error("Error searching rooms:", error);
      throw error;
    }
  }

  async getRoomImages(roomId) {
    try {
      const room = await this.getRoomById(roomId);
      return room.images || [];
    } catch (error) {
      console.error(`Error fetching images for room ${roomId}:`, error);
      throw error;
    }
  }

  async getPrimaryRoomImage(roomId) {
    try {
      const images = await this.getRoomImages(roomId);
      const primaryImage = images.find((img) => img.isPrimary);
      return primaryImage ? primaryImage.url : images[0]?.url || null;
    } catch (error) {
      console.error(`Error fetching primary image for room ${roomId}:`, error);
      throw error;
    }
  }

  async getRoomTypes() {
    try {
      return await this.httpService.get(`${this.basePath}/types`);
    } catch (error) {
      console.error("Error fetching room types:", error);
      throw error;
    }
  }
}

const roomService = new RoomService();
export default roomService;
