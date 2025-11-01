// /src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import statisticalService from '../../services/statistical.service';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
    <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <i className={`fas ${icon} ${color.text} text-2xl`}></i>
    </div>
    {loading ? (
      <div className="h-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
      </div>
    ) : (
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    )}
    <p className="text-gray-600">{title}</p>
  </div>
);

// Cấu hình biểu đồ
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: {
        callback: (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)
      }
    },
    x: { grid: { display: false } }
  },
  elements: { line: { tension: 0.3 } }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
    x: { grid: { display: false } }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' }
  }
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    bookedRooms: 0,
    occupancyRate: 0,
    revenue: 0
  });

  // Mock data cho biểu đồ (minh họa)
  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);

  useEffect(() => {
    // Lấy dữ liệu thật từ BE (chỉ 4 con số)
    const loadRealStats = async () => {
      try {
        const [totalRooms, bookedRooms, revenue] = await Promise.all([
          statisticalService.getTotalRooms(),
          statisticalService.getBookedRooms(),
          statisticalService.getRevenue(30)
        ]);
        const occupancyRate = totalRooms > 0 ? ((bookedRooms / totalRooms) * 100).toFixed(0) : 0;
        setStats({ totalRooms, bookedRooms, occupancyRate, revenue });
      } catch (err) {
        console.error("Load stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Dữ liệu minh họa cho biểu đồ (không gọi BE)
    const generateMockCharts = () => {
      // Line: Doanh thu 7 ngày
      const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const revenueData = [5e6, 7e6, 6e6, 8e6, 9e6, 10e6, 12e6];
      setLineData({
        labels: days,
        datasets: [{
          data: revenueData,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgb(34, 197, 94)',
          pointBackgroundColor: 'rgb(34, 197, 94)'
        }]
      });

      // Bar: Đặt phòng theo tháng (6 tháng)
      const months = ['Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10'];
      const bookingData = [24, 30, 28, 35, 40, 45];
      setBarData({
        labels: months,
        datasets: [{
          data: bookingData,
          backgroundColor: 'rgba(236, 72, 153, 0.6)',
          borderColor: 'rgb(236, 72, 153)',
          borderWidth: 1
        }]
      });

      // Pie: Tỷ lệ loại phòng
      setPieData({
        labels: ['Deluxe', 'Premium', 'Suite', 'VIP'],
        datasets: [{
          data: [40, 30, 20, 10],
          backgroundColor: [
            'rgb(59, 130, 246)', // blue-500
            'rgb(16, 185, 129)', // green-500
            'rgb(236, 72, 153)', // rose-500
            'rgb(245, 158, 11)'  // amber-500
          ],
          borderColor: 'white',
          borderWidth: 2
        }]
      });
    };

    loadRealStats();
    generateMockCharts();
  }, []);

  const formatRevenue = (amount) => (amount ? (amount / 1e6).toFixed(1) : '0');

  return (
    <div>
      <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">Bảng điều khiển</h2>
      
      {/* 4 Thẻ thống kê (dữ liệu thật từ BE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
       
        <Link to = "/admin/rooms"><StatCard
          title="Tổng số phòng"
          value={stats.totalRooms}
          icon="fa-bed"
          color={{ bg: 'bg-blue-100', text: 'text-blue-500' }}
          loading={loading}
        /></Link>
        <Link to="/admin/bookings">
        <StatCard
          title="Phòng đã đặt"
          value={stats.bookedRooms}
          icon="fa-calendar-check"
          color={{ bg: 'bg-green-100', text: 'text-green-500' }}
          loading={loading}
        />
        </Link>
        
        <StatCard
          title="Tỷ lệ lấp đầy"
          value={`${stats.occupancyRate}%`}
          icon="fa-chart-line"
          color={{ bg: 'bg-yellow-100', text: 'text-yellow-500' }}
          loading={loading}
        />
        <StatCard
          title="Doanh thu 30 ngày (VNĐ)"
          value={`${formatRevenue(stats.revenue)}M`}
          icon="fa-money-bill-wave"
          color={{ bg: 'bg-rose-100', text: 'text-rose-500' }}
          loading={loading}
        />
      </div>

      {/* Biểu đồ 1: Doanh thu (minh họa) */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Doanh thu tuần qua <span className="text-sm text-gray-500"></span>
        </h3>
        <div className="relative h-80">
          {lineData ? <Line options={lineOptions} data={lineData} /> : 
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      {/* Biểu đồ 2: Đặt phòng theo tháng (minh họa) */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Đặt phòng theo tháng <span className="text-sm text-gray-500"></span>
        </h3>
        <div className="relative h-80">
          {barData ? <Bar options={barOptions} data={barData} /> : 
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      {/* Biểu đồ 3: Tỷ lệ loại phòng (minh họa) */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Tỷ lệ đặt phòng theo loại phòng <span className="text-sm text-gray-500"></span>
        </h3>
        <div className="relative h-80">
          {pieData ? <Pie options={pieOptions} data={pieData} /> : 
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;