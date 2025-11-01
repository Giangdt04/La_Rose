import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chatbox from "../components/Chatbox";

const MainLayout = () => {
  return (
    <div className="font-poppins bg-rose-gradient min-h-screen flex flex-col">
      <Header />
      <Chatbox/>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;