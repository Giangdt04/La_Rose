import React from 'react';
import { useData } from '../../contexts/DataContext';

const CustomerManagement = () => {
    const { customers } = useData();
    
  return (
     <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-6">Quản lý khách hàng</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Tên</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Điện thoại</th>
                    <th scope="col" className="px-6 py-3">Số lần đặt</th>
                </tr>
             </thead>
             <tbody>
                {customers.map(customer => (
                    <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4">{customer.phone}</td>
                        <td className="px-6 py-4 text-center">{customer.totalBookings}</td>
                    </tr>
                ))}
             </tbody>
          </table>
        </div>
    </div>
  );
};

export default CustomerManagement;
