import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import RoomCard from '../components/RoomCard';
import { useEffect } from 'react';

const RoomsPage = () => {
  const { rooms } = useData();
  const [filteredRooms, setFilteredRooms] = useState(rooms);
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    let tempRooms = [...rooms];
    
    if (filters.type) {
      tempRooms = tempRooms.filter(room => room.type === filters.type);
    }
    
    if (filters.minPrice) {
      tempRooms = tempRooms.filter(room => room.price >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      tempRooms = tempRooms.filter(room => room.price <= parseInt(filters.maxPrice));
    }
    
    setFilteredRooms(tempRooms);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
      <div className="container mx-auto px-6 py-16">
          <h2 className="font-playfair text-4xl font-bold text-center text-rose-deep mb-12">
              Danh sách phòng
          </h2>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-rose p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loại phòng
                      </label>
                      <select
                          name="type"
                          value={filters.type}
                          onChange={handleFilterChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      >
                          <option value="">Tất cả</option>
                          <option value="standard">
                              Phòng tiêu chuẩn (Standard)
                          </option>
                          <option value="superior">
                              Phòng nâng cao (Superior)
                          </option>
                          <option value="deluxe">Phòng cao cấp (Deluxe)</option>
                          <option value="suite">Phòng hạng sang (Suite)</option>
                          <option value="honeymoon">
                              Phòng trăng mật (Honeymoon)
                          </option>
                          <option value="apartment">Căn hộ (Apartment)</option>
                          <option value="resort">
                              Khu nghỉ dưỡng (Resort)
                          </option>
                          <option value="villa">Biệt thự (Villa)</option>
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      />
                  </div>
              </div>
          </div>

          {/* Room List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                      <RoomCard key={room.id} room={room} />
                  ))
              ) : (
                  <p className="col-span-3 text-center text-gray-600">
                      Không tìm thấy phòng phù hợp.
                  </p>
              )}
          </div>
      </div>
  );
};

export default RoomsPage;
