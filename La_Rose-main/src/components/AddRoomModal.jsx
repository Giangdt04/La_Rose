import React, { useState } from 'react';

const AddRoomModal = ({ isOpen, onClose, onAddRoom }) => {
  const [newRoom, setNewRoom] = useState({ number: '', type: 'deluxe', price: '' });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRoom.number || !newRoom.price) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }
    onAddRoom({ ...newRoom, price: parseInt(newRoom.price) });
    setNewRoom({ number: '', type: 'deluxe', price: '' }); // Reset form
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h3 className="font-playfair text-2xl font-bold text-rose-deep text-center mb-6">Thêm phòng mới</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số phòng</label>
              <input type="text" name="number" value={newRoom.number} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
              <select name="type" value={newRoom.type} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg">
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="honeymoon">Honeymoon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
              <input type="number" name="price" value={newRoom.price} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg"/>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400">Hủy</button>
            <button type="submit" className="flex-1 bg-rose-500 text-white p-3 rounded-lg hover:bg-rose-600">Thêm phòng</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
