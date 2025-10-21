import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();

  const roomDetails = {
    deluxe: { name: 'Phòng Deluxe', icon: 'fas fa-bed', color: 'from-pink-200 to-rose-300', description: 'Phòng sang trọng với view thành phố tuyệt đẹp' },
    suite: { name: 'Phòng Suite', icon: 'fas fa-crown', color: 'from-yellow-200 to-amber-300', description: 'Không gian rộng rãi với tiện nghi cao cấp' },
    honeymoon: { name: 'Phòng Honeymoon', icon: 'fas fa-heart', color: 'from-purple-200 to-pink-300', description: 'Không gian lãng mạn dành cho cặp đôi' }
  };

  const details = roomDetails[room.type];

  const handleBookNow = () => {
    navigate('/booking', { state: { selectedRoomType: room.type } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-rose hover-lift overflow-hidden">
      <div className={`h-48 bg-gradient-to-br ${details.color} flex items-center justify-center`}>
        <i className={`${details.icon} text-white text-4xl`}></i>
      </div>
      <div className="p-6">
        <h4 className="font-playfair text-xl font-semibold text-rose-deep mb-2">{details.name}</h4>
        <p className="text-gray-600 mb-4 h-12">{details.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gold-deep">{room.price.toLocaleString()}₫</span>
          <button 
            onClick={handleBookNow} 
            className={`bg-rose-500 text-white px-4 py-2 rounded-lg transition-colors ${room.status !== 'available' ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:bg-rose-600'}`}
            disabled={room.status !== 'available'}
          >
            {room.status === 'available' ? 'Đặt ngay' : 'Đã đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;