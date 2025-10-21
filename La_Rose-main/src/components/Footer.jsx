import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <i className="fas fa-bed text-white"></i>
              </div>
              <h3 className="font-playfair text-xl font-bold">La Rosé</h3>
            </div>
            <p className="text-gray-400">Khách sạn sang trọng với phong cách nữ tính tinh tế, mang đến trải nghiệm nghỉ dưỡng đẳng cấp.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-2 text-gray-400">
              <p><i className="fas fa-map-marker-alt mr-2"></i>123 Đường ABC, Quận 1, TP.HCM</p>
              <p><i className="fas fa-phone mr-2"></i>(028) 1234 5678</p>
              <p><i className="fas fa-envelope mr-2"></i>info@larose.com</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/booking" className="hover:text-rose-300">Đặt phòng trực tuyến</Link></li>
              <li><a href="#" className="hover:text-rose-300">Dịch vụ spa</a></li>
              <li><a href="#" className="hover:text-rose-300">Nhà hàng cao cấp</a></li>
              <li><a href="#" className="hover:text-rose-300">Hội nghị & sự kiện</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 La Rosé Hotel. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;