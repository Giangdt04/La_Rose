import React, { useState, useEffect } from 'react';
import statisticalService from '../services/statistical.service';

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

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRooms: 0,
        bookedRooms: 0,
        occupancyRate: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                const [totalRooms, bookedRooms, revenue] = await Promise.all([
                    statisticalService.getTotalRooms(),
                    statisticalService.getBookedRooms(),
                    statisticalService.getRevenue(30)
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

        fetchStats();
    }, []);

    const formatRevenue = (amount) => {
        if (!amount) return '0';
        return (amount / 1000000).toFixed(1);
    };

  return (
    <div>
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">Bảng điều khiển</h2>
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
                title="Doanh thu (VNĐ)"
                value={`${formatRevenue(stats.revenue)}M`}
                icon="fa-money-bill-wave"
                color={{bg: 'bg-rose-100', text: 'text-rose-500'}}
                loading={loading}
            />
        </div>
    </div>
  );
};

export default AdminDashboard;
