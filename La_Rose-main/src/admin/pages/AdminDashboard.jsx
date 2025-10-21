import React from 'react';
import { useData } from '../../contexts/DataContext';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
      <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <i className={`fas ${icon} ${color.text} text-2xl`}></i>
      </div>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </div>
);

const AdminDashboard = () => {
    const { rooms, bookings } = useData();
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(0) : 0;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total, 0);

  return (
    <div>
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">Bảng điều khiển</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tổng số phòng" value={totalRooms} icon="fa-bed" color={{bg: 'bg-blue-100', text: 'text-blue-500'}} />
            <StatCard title="Phòng đã đặt" value={occupiedRooms} icon="fa-calendar-check" color={{bg: 'bg-green-100', text: 'text-green-500'}} />
            <StatCard title="Tỷ lệ lấp đầy" value={`${occupancyRate}%`} icon="fa-chart-line" color={{bg: 'bg-yellow-100', text: 'text-yellow-500'}} />
            <StatCard title="Doanh thu (VNĐ)" value={`${(totalRevenue / 1000000).toFixed(1)}M`} icon="fa-money-bill-wave" color={{bg: 'bg-rose-100', text: 'text-rose-500'}} />
        </div>
        
        {/* You can add charts or recent activity here */}
    </div>
  );
};

export default AdminDashboard;
