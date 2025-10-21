import React from 'react';

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-rose-gradient p-6 rounded-2xl shadow-rose">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center text-white font-semibold text-xl">
          {review.name.charAt(0)}
        </div>
        <div className="ml-4">
          <h5 className="font-semibold text-rose-deep">{review.name}</h5>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
          </div>
        </div>
      </div>
      <p className="text-gray-700">"{review.comment}"</p>
    </div>
  );
};

export default ReviewCard;