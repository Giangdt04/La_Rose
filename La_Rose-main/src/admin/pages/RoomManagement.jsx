import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import AddRoomModal from '../../components/AddRoomModal';

const RoomManagement = () => {
  const { rooms, addRoom, deleteRoom } = useData();
  const [isModalOpen, setModalOpen] = useState(false);

  const roomTypeNames = {
    deluxe: 'Deluxe',
    suite: 'Suite',
    honeymoon: 'Honeymoon'
  };
  
  const handleDelete = (roomId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) {
        deleteRoom(roomId);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-playfair font-bold text-gray-800">Quản lý phòng</h2>
          <button onClick={() => setModalOpen(true)} className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors">
            <i className="fas fa-plus mr-2"></i>Thêm phòng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Số phòng</th>
                <th scope="col" className="px-6 py-3">Loại</th>
                <th scope="col" className="px-6 py-3">Giá</th>
                <th scope="col" className="px-6 py-3">Trạng thái</th>
                <th scope="col" className="px-6 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{room.number}</td>
                  <td className="px-6 py-4">{roomTypeNames[room.type]}</td>
                  <td className="px-6 py-4">{room.price.toLocaleString()}₫</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {room.status === 'available' ? 'Trống' : 'Đã đặt'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddRoomModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onAddRoom={addRoom} />
    </>
  );
};

export default RoomManagement;
