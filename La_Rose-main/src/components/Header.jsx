import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import LoginModal from './LoginModal';

const Header = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  
  const navLinkClass = ({ isActive }) =>
    `nav-link transition-colors font-medium ${isActive ? 'text-rose-deep' : 'text-gray-700 hover:text-rose-deep'}`;

  return (
    <>
      <header className="glass-effect fixed w-full top-0 z-50 shadow-rose">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
               <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-bed text-white text-xl"></i> {/* Changed icon for better representation */}
               </div>
               <h1 className="font-playfair text-2xl font-bold text-rose-deep">La Rosé</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <NavLink to="/" className={navLinkClass}>Trang chủ</NavLink>
              <NavLink to="/rooms" className={navLinkClass}>Phòng</NavLink>
              <NavLink to="/booking" className={navLinkClass}>Đặt phòng</NavLink>
              <NavLink to="/admin" className={navLinkClass}>Quản lý</NavLink>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button onClick={() => setLoginModalOpen(true)} className="text-gray-700 hover:text-rose-deep transition-colors">
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};

export default Header;