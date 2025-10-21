import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const AdminSidebar = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center p-3 my-1 rounded-lg transition-colors ${isActive ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-rose-100 hover:text-rose-600'}`;

  return (
    <div className="w-64 bg-white shadow-lg h-screen p-4">
      <Link to="/" className="flex items-center space-x-3 mb-8 p-2">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
          <i className="fas fa-bed text-white"></i>
        </div>
        <h1 className="font-playfair text-xl font-bold text-rose-deep">La Rosé</h1>
      </Link>

      <nav>
        <NavLink to="/admin" end className={navLinkClass}>
          <i className="fas fa-tachometer-alt w-6 mr-3"></i>
          <span>Bảng điều khiển</span>
        </NavLink>
        <NavLink to="/admin/rooms" className={navLinkClass}>
          <i className="fas fa-bed w-6 mr-3"></i>
          <span>Quản lý phòng</span>
        </NavLink>
        <NavLink to="/admin/bookings" className={navLinkClass}>
          <i className="fas fa-calendar-check w-6 mr-3"></i>
          <span>Đơn đặt phòng</span>
        </NavLink>
        <NavLink to="/admin/customers" className={navLinkClass}>
          <i className="fas fa-users w-6 mr-3"></i>
          <span>Khách hàng</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
