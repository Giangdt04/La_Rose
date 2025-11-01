// /src/components/ReviewCard.jsx

import React from 'react';

const ReviewCard = ({ review }) => {
  // Lấy dữ liệu từ review object (đã được format ở HomePage)
  // Đặt giá trị mặc định để tránh lỗi
  const rating = review.rating || 5;
  const name = review.name || 'Khách ẩn danh';
  const comment = review.comment || 'Không có nội dung đánh giá.';
  const title = review.title; // Tiêu đề có thể là null

  return (
    <div className="bg-rose-gradient p-6 rounded-2xl shadow-rose h-full flex flex-col">
      <div className="flex items-center mb-4">
        {/* Lấy ký tự đầu của tên */}
        <div className="w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center text-white font-semibold text-xl">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4">
          <h5 className="font-semibold text-rose-deep">{name}</h5>
          <div className="flex text-yellow-400">
            {/* Hiển thị sao động:
              - 'fas fa-star' (sao đầy) nếu index < rating
              - 'far fa-star' (sao rỗng) nếu index >= rating
            */}
            {[...Array(5)].map((_, i) => (
              <i key={i} className={`fa-star ${i < rating ? 'fas' : 'far'}`}></i>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hiển thị tiêu đề (nếu có) */}
      {title && <h6 className="font-semibold text-gray-800 mb-2">"{title}"</h6>}
      
      {/* Hiển thị nội dung comment */}
      <p className="text-gray-700 flex-1">"{comment}"</p>
    </div>
  );
};

export default ReviewCard;