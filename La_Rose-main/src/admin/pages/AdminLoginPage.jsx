import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Shield, UserCog, Building, Sparkles, Lock } from "lucide-react";
import { useEffect } from "react";
import authService from "../../services/auth.service";
import session from "../../utils/SessionManager";

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        session.logout();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            toast.warning("⚠️ Email không hợp lệ!", {
                position: "top-right",
            });
            return;
        }

        if (!validatePassword(formData.password)) {
            toast.warning("⚠️ Mật khẩu phải có ít nhất 6 ký tự!", {
                position: "top-right",
            });
            return;
        }

        setIsLoading(true);

        try {
            const credentials = {
                email: formData.email,
                password: formData.password,
            };

            const response = await authService.login(credentials);
            console.log(response.userInfo.roles.name);

            // Kiểm tra role của user
            if (
                response.userInfo.roles[0].name !== "ADMIN" &&
                response.userInfo.roles[0].name !== "superadmin"
            ) {
                toast.error("❌ Bạn không có quyền truy cập trang quản trị!", {
                    position: "top-right",
                });
                session.logout();
                return;
            }

            session.saveAuth(response.accessToken);
            session.saveUser(response.userInfo);

            toast.success("🔐 Đăng nhập quản trị thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setTimeout(() => {
                navigate("/admin");
            }, 1000);
        } catch (error) {
            console.error("Admin login error:", error);
            toast.error(
                `❌ ${
                    error.message || "Đăng nhập thất bại! Vui lòng thử lại."
                }`,
                {
                    position: "top-right",
                },
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-rose-gradient relative overflow-hidden flex items-center justify-center p-4">
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply blur-xl opacity-30 animate-pulse delay-500"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full bg-rose-300 opacity-40 ${
                            i % 3 === 0
                                ? "animate-bounce"
                                : i % 3 === 1
                                ? "animate-pulse"
                                : "animate-ping"
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

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side - Admin Welcome Content */}
                <div className="text-center lg:text-left animate-fade-in">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                        <div className="w-12 h-12 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-rose">
                            <Shield className="w-6 h-6 text-rose-deep" />
                        </div>
                        <h1 className="font-playfair text-3xl font-bold text-rose-deep">
                            La Rosé Admin
                        </h1>
                    </div>

                    <h2 className="font-playfair text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                        Hệ thống <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">
                            Quản trị
                        </span>
                    </h2>

                    <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                        Truy cập vào hệ thống quản trị để quản lý khách sạn, đặt
                        phòng, người dùng và các tính năng quan trọng khác.
                    </p>

                    {/* Admin Features List */}
                    <div className="space-y-4 mb-8">
                        {[
                            {
                                icon: <Building className="w-5 h-5" />,
                                text: "Quản lý hệ thống khách sạn",
                            },
                            {
                                icon: <UserCog className="w-5 h-5" />,
                                text: "Quản lý người dùng & nhân viên",
                            },
                            {
                                icon: <Lock className="w-5 h-5" />,
                                text: "Bảo mật cấp cao",
                            },
                            {
                                icon: <Shield className="w-5 h-5" />,
                                text: "Quyền truy cập đặc biệt",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-gray-700"
                            >
                                <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center text-rose-deep shadow-rose">
                                    {feature.icon}
                                </div>
                                <span className="text-lg">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Security Notice */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200 shadow-rose">
                        <div className="flex items-center gap-3 text-rose-deep">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                Khu vực bảo mật cao
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            Chỉ dành cho nhân viên và quản trị viên được ủy
                            quyền. Mọi hoạt động đều được ghi lại.
                        </p>
                    </div>
                </div>

                {/* Right Side - Admin Login Form */}
                <div className="glass-effect bg-white/90 backdrop-blur-md rounded-3xl shadow-rose p-8 lg:p-10 animate-fade-in border border-rose-100 hover-lift">
                    {/* Admin Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-rose mx-auto mb-4">
                            <Lock className="w-8 h-8 text-rose-deep" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Đăng nhập Quản trị
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Sử dụng tài khoản quản trị để tiếp tục
                        </p>
                    </div>

                    <form onSubmit={handleAdminLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email quản trị *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300 text-gray-800 placeholder-gray-400 shadow-sm"
                                    placeholder="admin@larose.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300 text-gray-800 placeholder-gray-400 shadow-sm"
                                    placeholder="••••••••"
                                    minLength="6"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Mật khẩu phải có ít nhất 6 ký tự
                                </p>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-200">
                            <div className="flex items-center gap-2 text-rose-700 text-sm">
                                <Shield className="w-4 h-4" />
                                <span>Kết nối được bảo mật bằng mã hóa</span>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-6 bg-gradient-to-r from-rose-600 to-amber-600 text-white p-4 rounded-xl font-semibold shadow-rose transform transition-all duration-300 group ${
                                isLoading
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:shadow-lg hover:scale-105 hover:from-rose-700 hover:to-amber-700"
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang xác thực...
                                    </>
                                ) : (
                                    <>
                                        Đăng nhập Quản trị
                                        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Back to main site */}
                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="text-rose-deep hover:text-rose-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <Building className="w-4 h-4" />
                            Quay lại trang chủ khách hàng
                        </Link>
                    </div>

                    {/* Admin Notice */}
                    <div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 text-center">
                            ⚠️ CẢNH BÁO: Truy cập trái phép vào hệ thống quản
                            trị là bất hợp pháp và sẽ bị xử lý theo quy định của
                            pháp luật.
                        </p>
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

export default AdminLoginPage;
