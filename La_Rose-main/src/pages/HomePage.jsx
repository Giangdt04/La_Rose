// /src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import ReviewCard from '../components/ReviewCard';
import reviewService from '../services/review.service'; 
import roomService from '../services/room.service'; 
import anhnen from '../assets/pexels-pixabay-53464.jpg';

/**
 * Component StarRating nội bộ để chọn sao.
 */
const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center text-3xl text-gray-300">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            className={`cursor-pointer ${starValue <= rating ? 'text-yellow-400' : ''}`}
            onClick={() => setRating(starValue)}
            style={{ transition: 'color 0.2s' }}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};


const HomePage = () => {
  const navigate = useNavigate();
  
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null); // Lỗi chung của trang

  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5); 

  // State cho thông báo của form (đã có)
  const [formMessage, setFormMessage] = useState({ type: '', content: '' });
  // State kiểm tra đăng nhập (đã có)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * Hàm xử lý khi nhấn "Đặt ngay" – GIỐNG HỆT RoomsPage
   */
  const handleBookNowClick = (room) => {
    const bookingData = {
      roomId: room.id,
      roomType: room.roomType?.name || room.title || "Không xác định",
      roomNumber: room.code,
      price: room.price || room.roomType?.basePrice || room.pricePerNight || 0,
      roomTitle: room.title,
      roomDescription: room.description,
      roomArea: room.area,
      roomCapacity: room.roomType?.maxGuests || room.capacity || 2,
      roomImages: room.images,
      status: room.status,
    };

    navigate("/booking", {
      state: {
        preFilledData: bookingData,
        fromRoomPage: true,
      },
    });
  };

  /**
   * Hàm chuyển đổi DTO từ backend sang cấu trúc mà <ReviewCard> mong đợi.
   */
  const formatReviewForCard = (dto) => {
    return {
      id: dto.id,
      name: dto.userFullName || 'Khách ẩn danh', 
      comment: dto.content,
      rating: dto.rating,
      title: dto.title
    };
  };

  // Fetch 3 phòng nổi bật
  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await roomService.getAllRooms({ page: 0, size: 3 });
        setFeaturedRooms(response.content || []); 
      } catch (err) {
        console.error("Lỗi khi tải phòng nổi bật:", err);
        setError("Không thể tải phòng nổi bật.");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchFeaturedRooms();
  }, []);

  // useEffect kiểm tra đăng nhập (đã có)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const dtoList = await reviewService.getAllReviews();
        const formattedReviews = dtoList.map(formatReviewForCard);
        setReviews(formattedReviews);
      } catch (err) {
        console.error("Lỗi khi tải đánh giá:", err);
        if (!error) { 
            setError("Không thể tải danh sách đánh giá.");
        }
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [error]); 

  const handleSubmitReview = async (e) => {
    e.preventDefault(); 
    // Xóa thông báo cũ
    setFormMessage({ type: '', content: '' }); 
    
    if (!isLoggedIn) {
      // ✅ SỬA: Thay alert bằng setFormMessage
      setFormMessage({ type: 'error', content: 'Bạn cần đăng nhập để gửi đánh giá.' });
      // Chờ 2 giây rồi hẵng chuyển trang
      setTimeout(() => {
          navigate('/login');
      }, 2000);
        return;
    }
    if (!newReviewTitle.trim() || !newReviewComment.trim()) {
      // ✅ SỬA: Thay alert bằng setFormMessage
      setFormMessage({ type: 'error', content: 'Vui lòng nhập đầy đủ tiêu đề và nội dung đánh giá.' });
      return;
    }

    const reviewData = {
      title: newReviewTitle,
      content: newReviewComment,
      rating: newReviewRating,
    };

    try {
      const newReviewDTO = await reviewService.createReview(reviewData);
      const formattedReview = formatReviewForCard(newReviewDTO);
      setReviews([formattedReview, ...reviews]);
      setNewReviewTitle('');
      setNewReviewComment('');
      setNewReviewRating(5);
      setError(null); // Xóa lỗi chung của trang (nếu có)
      
      // ✅ SỬA: Thay alert bằng setFormMessage (thành công)
      setFormMessage({ type: 'success', content: 'Gửi đánh giá thành công!' });

    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      const errorMessage = err.message || 'Bạn cần đăng nhập để thực hiện việc này.';
      
      // ✅ SỬA: Thay alert và setError bằng setFormMessage (lỗi)
      setFormMessage({ type: 'error', content: `Gửi đánh giá thất bại: ${errorMessage}` });
    }
  };

  return (
    <div>
      {/* Hero Section */}
    <section
  className="h-screen flex items-center justify-center text-center -mt-20 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${anhnen})`,
  }}
>
  <div className="animate-fade-in bg-opacity-40 w-full h-full flex items-center justify-center">
    <div className="text-white px-4">
      <h2 className="font-playfair text-5xl md:text-7xl font-bold mb-6">
        Chào mừng đến La Rosé
      </h2>
      <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
        Trải nghiệm nghỉ dưỡng sang trọng với phong cách nữ tính tinh tế
      </p>
      <button 
        onClick={() => navigate('/rooms')} 
        className="bg-gradient-to-r from-pink-400 to-rose-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
      >
        Đặt phòng ngay
      </button>
    </div>
  </div>
</section>

      {/* Featured Rooms */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="font-playfair text-4xl font-bold text-center text-rose-deep mb-12">Phòng nổi bật</h3>
        
        {loadingRooms ? (
            <p className="text-center text-gray-600">Đang tải phòng...</p>
       ) : error && featuredRooms.length === 0 ? (
          // ✅ SỬA: Dùng style giống RoomsPage
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                primaryImageUrl={
                  room.images?.find(img => img.isPrimary)?.url || room.images?.[0]?.url
                }
                onBookNow={() => handleBookNowClick(room)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="font-playfair text-4xl font-bold text-center text-rose-deep mb-12">Đánh giá của khách hàng</h3>
          
          {loadingReviews ? (
            <p className="text-center text-gray-600">Đang tải đánh giá...</p>
       ) : error && reviews.length === 0 ? (
          // ✅ SỬA: Dùng style giống RoomsPage
              <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
          ) : (
            <>
              {reviews.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Chưa có đánh giá nào được hiển thị.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* New Review Form Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="font-playfair text-4xl font-bold text-center text-rose-deep mb-12">Gửi phản hồi của bạn</h3>
        
        {/* ✅ SỬA: Chỉ hiển thị khi CHƯA đăng nhập */}
        {!isLoggedIn && (
          <p className="text-center text-gray-600 mb-8 -mt-8">
            Bạn cần <a href="/login" className="text-rose-500 hover:underline font-medium">đăng nhập</a> để gửi đánh giá.
          </p>
        )}
        
        <form onSubmit={handleSubmitReview} className="max-w-xl mx-auto bg-gray-50 p-8 rounded-lg shadow-md">
          
          {/* ✅ SỬA: Hiển thị thông báo Lỗi/Thành công của Form */}
          {formMessage.content && (
            <div 
              className={`text-center p-4 rounded-lg mb-6 ${
                formMessage.type === 'error' 
                  ? 'bg-red-50 text-red-600' // Style lỗi
                  : 'bg-green-50 text-green-600' // Style thành công
              }`}
            >
              {formMessage.content}
            </div>
          )}
          
          {/* ✅ SỬA: Bọc form trong fieldset để vô hiệu hóa */}
          <fieldset 
            disabled={!isLoggedIn} 
            className="disabled:opacity-60 disabled:cursor-not-allowed"
          >
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-3 text-center">Bạn đánh giá bao nhiêu sao?</label>
            <StarRating rating={newReviewRating} setRating={setNewReviewRating} />
          </div>

          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Tiêu đề đánh giá</label>
            <input 
              type="text" 
              id="title"
              value={newReviewTitle}
              onChange={(e) => setNewReviewTitle(e.target.value)}
              // Thêm style khi bị vô hiệu hóa
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-200"
              placeholder="Ví dụ: Kỳ nghỉ tuyệt vời!"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Nội dung đánh giá</label>
            <textarea 
              id="comment"
              rows="5"
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              // Thêm style khi bị vô hiệu hóa
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-200"
              placeholder="Cảm nhận của bạn về La Rosé..."
              required
            />
         </div>

          <div className="text-center">
            <button 
              type="submit"
              // Thêm style khi bị vô hiệu hóa
              className="bg-gradient-to-r from-pink-400 to-rose-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:from-pink-200 disabled:to-rose-300"
trang         >
              Gửi đánh giá
            </button>
          </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
};

export default HomePage;