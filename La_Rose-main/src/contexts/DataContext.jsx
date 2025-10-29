import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const initialData = {
  rooms: [
    { id: 1, number: '101', type: 'deluxe', price: 2500000, status: 'available' },
    { id: 2, number: '102', type: 'deluxe', price: 2500000, status: 'offline' },
    { id: 3, number: '201', type: 'suite', price: 4500000, status: 'available' },
    { id: 4, number: '301', type: 'honeymoon', price: 3800000, status: 'available' }
  ],
  bookings: [
    { id: 1, customer: 'Nguyễn Thị Lan', roomNumber: '102', dates: '2024-10-15 - 2024-10-17', total: 5000000, status: 'confirmed' },
    { id: 2, customer: 'Trần Văn Nam', roomNumber: '201', dates: '2024-10-20 - 2024-10-22', total: 9000000, status: 'pending' }
  ],
  customers: [
    { id: 1, name: 'Nguyễn Thị Lan', email: 'lan@email.com', phone: '0901234567', totalBookings: 3 },
    { id: 2, name: 'Trần Văn Nam', email: 'nam@email.com', phone: '0907654321', totalBookings: 1 }
  ]
};

export const DataProvider = ({ children }) => {
  const [rooms, setRooms] = useState(initialData.rooms);
  const [bookings, setBookings] = useState(initialData.bookings);
  const [customers, setCustomers] = useState(initialData.customers);

  const addRoom = (newRoom) => {
    setRooms(prevRooms => [...prevRooms, { ...newRoom, id: prevRooms.length + 1, status: 'available' }]);
  };

  const deleteRoom = (roomId) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
  };
  
  const addBooking = (newBooking) => {
    setBookings(prev => [...prev, { ...newBooking, id: prev.length + 1 }]);
    // Logic to update room status
    const roomToUpdate = rooms.find(r => r.number === newBooking.roomNumber);
    if (roomToUpdate) {
        setRooms(prevRooms => prevRooms.map(r => r.id === roomToUpdate.id ? {...r, status: 'offline'} : r));
    }
  };

  const cancelBooking = (bookingId) => {
     const bookingToCancel = bookings.find(b => b.id === bookingId);
     if (bookingToCancel) {
        // Logic to make room available again
        const roomToUpdate = rooms.find(r => r.number === bookingToCancel.roomNumber);
        if(roomToUpdate) {
             setRooms(prevRooms => prevRooms.map(r => r.id === roomToUpdate.id ? {...r, status: 'available'} : r));
        }
     }
     setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const value = {
    rooms,
    bookings,
    customers,
    addRoom,
    deleteRoom,
    addBooking,
    cancelBooking,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};