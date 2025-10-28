import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import RoomCard from '../components/RoomCard';
import ReviewCard from '../components/ReviewCard';

const HomePage = () => {
  const navigate = useNavigate();
  const { rooms } = useData();
  
  const featuredRooms = rooms.slice(0, 3); // Lấy 3 phòng đầu tiên làm nổi bật
  
  const reviews = [
    { name: 'Anh Thư', comment: 'Khách sạn tuyệt vời! Phòng rất sạch sẽ và dịch vụ chu đáo. Tôi sẽ quay lại lần nữa.' },
    { name: 'Mai Linh', comment: 'Thiết kế rất đẹp và sang trọng. Nhân viên thân thiện, nhiệt tình. Rất hài lòng!' },
    { name: 'Hương Giang', comment: 'Kỳ nghỉ tuyệt vời với bạn bè. Phòng rộng rãi, view đẹp. Chắc chắn sẽ giới thiệu cho mọi người.' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-bg h-screen flex items-center justify-center text-center -mt-20">
        <div className="animate-fade-in">
          <h2 className="font-playfair text-5xl md:text-7xl font-bold text-rose-deep mb-6">
            Chào mừng đến La Rosé
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Trải nghiệm nghỉ dưỡng sang trọng với phong cách nữ tính tinh tế
          </p>
          <button 
            onClick={() => navigate('/rooms')} 
            className="bg-gradient-to-r from-pink-400 to-rose-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Đặt phòng ngay
          </button>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="font-playfair text-4xl font-bold text-center text-rose-deep mb-12">Phòng nổi bật</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="font-playfair text-4xl font-bold text-center text-rose-deep mb-12">Đánh giá của khách hàng</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
