import React from 'react';
import { useData } from '../../contexts/DataContext';

const BookingManagement = () => {
    const { bookings, cancelBooking } = useData();

    const handleCancel = (bookingId) => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) {
            cancelBooking(bookingId);
        }
    };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-6">Quản lý đơn đặt phòng</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Mã đơn</th>
                    <th scope="col" className="px-6 py-3">Khách hàng</th>
                    <th scope="col" className="px-6 py-3">Số phòng</th>
                    <th scope="col" className="px-6 py-3">Ngày</th>
                    <th scope="col" className="px-6 py-3">Tổng tiền</th>
                    <th scope="col" className="px-6 py-3">Trạng thái</th>
                    <th scope="col" className="px-6 py-3">Thao tác</th>
                </tr>
             </thead>
             <tbody>
                {bookings.map(booking => (
                    <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">#{booking.id.toString().padStart(3, '0')}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{booking.customer}</td>
                        <td className="px-6 py-4">{booking.roomNumber}</td>
                        <td className="px-6 py-4">{booking.dates}</td>
                        <td className="px-6 py-4">{booking.total.toLocaleString()}₫</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => handleCancel(booking.id)} className="text-red-600 hover:text-red-800">
                                <i className="fas fa-times-circle"></i> Hủy
                            </button>
                        </td>
                    </tr>
                ))}
             </tbody>
          </table>
        </div>
    </div>
  );
};

export default BookingManagement;
