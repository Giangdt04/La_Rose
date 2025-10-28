import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Edit3,
    Save,
    X,
    LogOut,
    Home,
    Star,
    Clock,
} from "lucide-react";
import session from "../utils/SessionManager";
import authService from "../services/auth.service";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState({
        id: 3,
        email: "ngoclanhlethi2@gmail.com",
        fullName: "Nguyen Van A",
        phone: "0123456789",
        isActive: true,
        emailVerified: false,
        lastLogin: "2025-10-25T17:58:02.6120839",
        createdAt: "2025-10-25T16:19:17",
    });
    const [editData, setEditData] = useState({ ...userData });

    useEffect(() => {
        // Lấy thông tin user từ session hoặc API
        const currentUser = session.getUser();
        if (currentUser) {
            setUserData(currentUser);
            setEditData(currentUser);
        }
    }, []);

    const handleInputChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value,
        });
    };

    const validatePhone = (phone) => {
        const phoneRegex =
            /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
        return phoneRegex.test(phone);
    };

    const validateFullName = (fullName) => {
        return fullName.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s]+$/.test(fullName);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!validateFullName(editData.fullName)) {
            toast.warning(
                "⚠️ Họ và tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái!",
                {
                    position: "top-right",
                },
            );
            return;
        }

        if (!validatePhone(editData.phone)) {
            toast.warning("⚠️ Số điện thoại không hợp lệ!", {
                position: "top-right",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Gọi API update profile
            const response = await authService.updateProfile(editData);

            // Cập nhật session và state
            session.saveUser(response.userInfo);
            setUserData(response.userInfo);
            setIsEditing(false);

            toast.success("✅ Cập nhật thông tin thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error(`❌ ${error.message || "Cập nhật thất bại!"}`, {
                position: "top-right",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditData({ ...userData });
        setIsEditing(false);
    };

    const handleLogout = () => {
        session.logout();
        toast.info("👋 Đã đăng xuất!", {
            position: "top-right",
            autoClose: 2000,
        });
        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (isActive, emailVerified) => {
        if (!isActive) {
            return (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Không hoạt động
                </span>
            );
        }
        if (!emailVerified) {
            return (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Chưa xác thực
                </span>
            );
        }
        return (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Đã xác thực
            </span>
        );
    };

    return (
        <div className="min-h-screen pt-16 bg-rose-gradient relative overflow-hidden">
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-medium"></div>
                <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse-slow"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full bg-pink-300 opacity-60 animate-float-${
                            i % 3 === 0
                                ? "slow"
                                : i % 3 === 1
                                ? "medium"
                                : "fast"
                        }`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                    ></div>
                ))}
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-playfair text-4xl font-bold text-rose-deep">
                            Hồ Sơ Cá Nhân
                        </h1>
                    </div>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Quản lý thông tin cá nhân và tùy chỉnh tài khoản của bạn
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-effect rounded-3xl shadow-rose p-6 border border-pink-100">
                            {/* User Summary */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                                    <User className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    {userData.fullName}
                                </h2>
                                <div className="mb-4">
                                    {getStatusBadge(
                                        userData.isActive,
                                        userData.emailVerified,
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Thành viên từ{" "}
                                    {formatDate(userData.createdAt)}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate("/")}
                                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-pink-50 rounded-xl transition-all duration-300 group"
                                >
                                    <Home className="w-5 h-5 group-hover:text-rose-500" />
                                    <span>Trang chủ</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                                >
                                    <LogOut className="w-5 h-5 group-hover:text-red-700" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="glass-effect rounded-3xl shadow-rose p-8 border border-pink-100">
                            {/* Header với nút Edit */}
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    Thông tin cá nhân
                                </h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                                        >
                                            <X className="w-4 h-4" />
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {isLoading ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form thông tin */}
                            <form onSubmit={handleSaveProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="animate-slide-down">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4" />
                                            Họ và tên
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={editData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                                placeholder="Nhập họ và tên"
                                            />
                                        ) : (
                                            <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700">
                                                {userData.fullName}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="animate-slide-down delay-100">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4" />
                                            Email
                                        </label>
                                        <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 flex items-center justify-between">
                                            <span>{userData.email}</span>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="animate-slide-down delay-200">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="w-4 h-4" />
                                            Số điện thoại
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        ) : (
                                            <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700">
                                                {userData.phone}
                                            </div>
                                        )}
                                    </div>

                                    {/* User ID */}
                                    <div className="animate-slide-down delay-300">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Shield className="w-4 h-4" />
                                            Mã người dùng
                                        </label>
                                        <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 font-mono">
                                            #{userData.id}
                                        </div>
                                    </div>

                                    {/* Last Login */}
                                    <div className="animate-slide-down delay-400">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4" />
                                            Đăng nhập gần nhất
                                        </label>
                                        <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700">
                                            {formatDate(userData.lastLogin)}
                                        </div>
                                    </div>

                                    {/* Created Date */}
                                    <div className="animate-slide-down delay-500">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            Ngày tạo tài khoản
                                        </label>
                                        <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700">
                                            {formatDate(userData.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Thông tin bổ sung */}
                            {/* <div className="mt-8 pt-8 border-t border-gray-200">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">
                                    Thống kê tài khoản
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                        <div className="text-2xl font-bold text-rose-deep">
                                            0
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Đơn đặt phòng
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                        <div className="text-2xl font-bold text-rose-deep">
                                            0
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Đánh giá
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                        <div className="text-sm text-gray-600">
                                            Thành viên
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                        <div className="text-2xl font-bold text-rose-deep">
                                            100%
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Hoàn thành hồ sơ
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* React Toastify Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default ProfilePage;
