import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import { LogOut, User, Bell, Search } from "lucide-react";
import session from "../utils/SessionManager";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState(3); // Example notification count

    useEffect(() => {
        setNotifications(3);
        const currentUser = session.getUser();
        if (
            !currentUser ||
            (currentUser.roles[0].name.toLowerCase() !== "admin" &&
                currentUser.roles[0].name.toLowerCase() !== "superadmin")
        ) {
            navigate("/admin/login");
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    const handleLogout = () => {
        session.logout();
        navigate("/admin/login");
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/admin") return "Tổng quan";
        if (path === "/admin/users") return "Quản lý Người dùng";
        if (path === "/admin/hotels") return "Quản lý Khách sạn";
        if (path === "/admin/bookings") return "Quản lý Đặt phòng";
        if (path === "/admin/rooms") return "Quản lý Phòng";
        return "Trang Quản Trị";
    };

    return (
        <div className="flex h-screen bg-gray-50 font-poppins">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                {getPageTitle()}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Hệ thống quản trị La Rosé Hotel
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                                <Bell className="w-6 h-6" />
                                {notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800">
                                        {user?.fullName || "Quản trị viên"}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user?.role || "admin"}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    <User className="w-5 h-5" />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
