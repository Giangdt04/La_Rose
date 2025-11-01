// /src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import statisticalService from '../services/statistical.service';
// ✅ SỬA: Import các thành phần của Chart.js
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// ✅ SỬA: Đăng ký các thành phần Chart.js (bắt buộc)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Component StatCard (giữ nguyên)
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

// ✅ SỬA: Thêm Cấu hình cho biểu đồ
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Thêm dòng này để biểu đồ vừa vặn
    plugins: {
        legend: {
            display: false, // Ẩn chú thích
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = 'Doanh thu: ';
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            ticks: {
                callback: function(value) {
                    return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value);
                }
            }
        },
        x: {
            grid: {
                display: false,
            }
        }
    },
    elements: {
        line: {
            tension: 0.3
        }
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

    // ✅ SỬA: Thêm state cho biểu đồ
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(true);

    useEffect(() => {
        // Hàm lấy số liệu (giữ nguyên)
        const fetchStats = async () => {
            try {
                // setLoading(true) đã được gọi ở ngoài
                const [totalRooms, bookedRooms, revenue] = await Promise.all([
                    statisticalService.getTotalRooms(),
                    statisticalService.getBookedRooms(),
                    statisticalService.getRevenue(30) // Lấy doanh thu 30 ngày cho thẻ
                ]);

                const occupancyRate = totalRooms > 0
                    ? ((bookedRooms / totalRooms) * 100).toFixed(0)
                    : 0;

                setStats({
                    totalRooms: totalRooms || 0,
                    bookedRooms: bookedRooms || 0,
                    occupancyRate: occupancyRate,
                    revenue: revenue || 0
                });
            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        // ✅ SỬA: Thêm hàm lấy dữ liệu biểu đồ (7 ngày = 1 tuần)
        const fetchChartData = async () => {
            try {
                setChartLoading(true);
                // Gọi hàm mới từ service, lấy 7 ngày
                const chartResponse = await statisticalService.getRevenueChartData(7);

                setChartData({
                    labels: chartResponse.labels,
                    datasets: [
                        {
                            label: 'Doanh thu',
                            data: chartResponse.data,
                            fill: true,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)', // Màu nền green-500
                            borderColor: 'rgb(34, 197, 94)', // Màu đường green-500
                            pointBackgroundColor: 'rgb(34, 197, 94)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgb(34, 197, 94)',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setChartLoading(false);
            }
        };

        fetchStats();
        fetchChartData(); // ✅ SỬA: Gọi hàm mới
    }, []);

    const formatRevenue = (amount) => {
        if (!amount) return '0';
        return (amount / 1000000).toFixed(1);
    };

 return (
    <div>
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">Bảng điều khiển</h2>
        {/* 4 Thẻ thống kê (giữ nguyên) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Tổng số phòng"
                value={stats.totalRooms}
                icon="fa-bed"
                color={{bg: 'bg-blue-100', text: 'text-blue-500'}}
                loading={loading}
            />
            <StatCard
                title="Phòng đã đặt"
                value={stats.bookedRooms}
                icon="fa-calendar-check"
                color={{bg: 'bg-green-100', text: 'text-green-500'}}
                loading={loading}
            />
            <StatCard
                title="Tỷ lệ lấp đầy"
                value={`${stats.occupancyRate}%`}
                icon="fa-chart-line"
                color={{bg: 'bg-yellow-100', text: 'text-yellow-500'}}
                loading={loading}
            />
            <StatCard
                title="Doanh thu 30 ngày (VNĐ)"
                value={`${formatRevenue(stats.revenue)}M`}
                icon="fa-money-bill-wave"
                color={{bg: 'bg-rose-100', text: 'text-rose-500'}}
                loading={loading}
            />
        </div>

        {/* ✅ SỬA: Thêm khu vực biểu đồ */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
                Doanh thu tuần qua (7 ngày)
            </h3>
            {/* Đặt chiều cao cố định cho biểu đồ */}
            <div className="relative h-80"> 
                {chartLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
                        <span className="ml-3 text-gray-600">Đang tải dữ liệu biểu đồ...</span>
                    </div>
                ) : (
                    chartData && <Line options={chartOptions} data={chartData} />
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;