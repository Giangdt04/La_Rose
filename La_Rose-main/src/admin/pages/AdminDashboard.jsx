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
  elements: { line: { tension: 0.3, fill: true } }
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

  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [totalRoomsRes, bookedRoomsRes, revenueRes] = await Promise.all([
          statisticalService.getTotalRooms(),
          statisticalService.getBookedRooms(),
          statisticalService.getRevenue(30)
        ]);

        const totalRooms = totalRoomsRes.data || totalRoomsRes || 0;
        const bookedRooms = bookedRoomsRes.data || bookedRoomsRes || 0;
        const revenue = revenueRes.data || revenueRes || 0;
        const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

        setStats({ totalRooms, bookedRooms, occupancyRate, revenue });

        const [dailyRes, occupancyRes] = await Promise.all([
          statisticalService.getDailyRevenue(7),
          statisticalService.getOccupancyRate('2025-01-01', '2025-12-31')
        ]);

        const dailyData = (dailyRes.data || dailyRes || [])
          .map(item => ({
            date: item.date,
            revenue: parseFloat(item.revenue)
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const formatDateLabel = (dateStr) => {
          const date = new Date(dateStr);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const dayIndex = date.getDay();
          const label = weekdays[dayIndex === 0 ? 0 : dayIndex];
          return `${label}, ${date.getDate()}/${date.getMonth() + 1}`;
        };

        // ✅ SỬA LỖI: THÊM `data:` ĐẦY ĐỦ
        setLineData({
          labels: dailyData.map(d => formatDateLabel(d.date)),
          datasets: [{
            data: dailyData.map(d => d.revenue), // ← có `data:`
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)'
          }]
        });

        setBarData({
          labels: dailyData.map(d => formatDateLabel(d.date)),
          datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: dailyData.map(d => d.revenue), // ← có `data:`
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        });

        const occ = occupancyRes.data || occupancyRes || { bookedRooms: 0, totalRooms: totalRooms || 1 };
        const freeRooms = occ.totalRooms - occ.bookedRooms;
        setPieData({
          labels: ['Đã thuê', 'Trống'],
          datasets: [{
            data: [occ.bookedRooms, freeRooms], // ← có `data:`
            backgroundColor: [
              'rgb(239, 68, 68)',
              'rgb(34, 197, 94)'
            ],
            borderColor: 'white',
            borderWidth: 2
          }]
        });

      } catch (err) {
        console.error("Load dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatRevenue = (amount) => (amount ? (amount / 1e6).toFixed(1) : '0');

  return (
    <div>
      <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">Bảng điều khiển</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/rooms">
          <StatCard
            title="Tổng số phòng"
            value={stats.totalRooms}
            icon="fa-bed"
            color={{ bg: 'bg-blue-100', text: 'text-blue-500' }}
            loading={loading}
          />
        </Link>
        <StatCard
          title="Phòng đã đặt"
          value={stats.bookedRooms}
          icon="fa-calendar-check"
          color={{ bg: 'bg-green-100', text: 'text-green-500' }}
          loading={loading}
        />
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

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Doanh thu tuần gần nhất
        </h3>
        <div className="relative h-80">
          {lineData ? <Line options={lineOptions} data={lineData} /> :
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Chi tiết doanh thu theo ngày
        </h3>
        <div className="relative h-80">
          {barData ? <Bar options={barOptions} data={barData} /> :
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Tỷ lệ phòng đã thuê vs trống
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