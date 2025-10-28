import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Home, Key, Shield, Star, Sparkles, Building } from "lucide-react";
import { useEffect } from "react";
import authService from "../services/auth.service";
import session from "../utils/SessionManager";

const LoginPage = ({ state }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(state);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        fullName: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        session.logout();
    }, []);

    useEffect(() => {
        setActiveTab(state);
    }, [state]);

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

    const validatePhone = (phone) => {
        const phoneRegex =
            /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validateFullName = (fullName) => {
        return fullName.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s]+$/.test(fullName);
    };

    const handleLogin = async (e) => {
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
            console.log(response);
            session.saveAuth(response.accessToken);
            session.saveUser(response.userInfo);

            toast.success("🛎️ Đăng nhập thành công! Chào mừng trở lại!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (error) {
            console.error("Login error:", error);
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

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate all fields
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

        if (formData.password !== formData.confirmPassword) {
            toast.warning("⚠️ Mật khẩu xác nhận không khớp!", {
                position: "top-right",
            });
            return;
        }

        if (!validateFullName(formData.fullName)) {
            toast.warning(
                "⚠️ Họ và tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái!",
                {
                    position: "top-right",
                },
            );
            return;
        }

        if (!validatePhone(formData.phone)) {
            toast.warning(
                "⚠️ Số điện thoại không hợp lệ! Ví dụ: 0912345678 hoặc +84912345678",
                {
                    position: "top-right",
                },
            );
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone,
            };

            const response = await authService.signup(userData);
            console.log(response);

            toast.success(
                "🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
                {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                },
            );

            // Reset form và chuyển sang tab login
            setTimeout(() => {
                setActiveTab("login");
                resetForm();
            }, 1500);
        } catch (error) {
            console.error("Register error:", error);
            toast.error(
                `❌ ${error.message || "Đăng ký thất bại! Vui lòng thử lại."}`,
                {
                    position: "top-right",
                },
            );
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            fullName: "",
        });
    };

    const handleForgotPassword = () => {
        toast.info(
            "📧 Liên kết khôi phục mật khẩu đã được gửi đến email của bạn!",
            {
                position: "top-right",
                autoClose: 4000,
            },
        );
    };

    return (
        <div className="min-h-screen bg-rose-gradient relative overflow-hidden flex items-center justify-center p-4">
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

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side - Welcome Content */}
                <div className="text-center lg:text-left animate-fade-in-up">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-playfair text-3xl font-bold text-rose-deep">
                            La Rosé
                        </h1>
                    </div>

                    <h2 className="font-playfair text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                        Chào mừng đến với <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
                            La Rosé
                        </span>
                    </h2>

                    <p className="text-xl text-gray-700 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                        Khám phá không gian nghỉ dưỡng tuyệt vời. Đăng nhập để
                        đặt phòng hoặc tạo tài khoản để bắt đầu hành trình của
                        bạn.
                    </p>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                        {[
                            {
                                icon: <Home className="w-5 h-5" />,
                                text: "Hơn 1000+ phòng chất lượng",
                            },
                            {
                                icon: <Key className="w-5 h-5" />,
                                text: "Đặt phòng nhanh chóng, dễ dàng",
                            },
                            {
                                icon: <Shield className="w-5 h-5" />,
                                text: "Bảo mật & an toàn tuyệt đối",
                            },
                            {
                                icon: <Star className="w-5 h-5" />,
                                text: "Đánh giá 5* từ khách hàng",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-gray-700 animate-slide-up"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white">
                                    {feature.icon}
                                </div>
                                <span className="text-lg">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 text-center lg:text-left">
                        <div>
                            <div className="text-2xl font-bold text-rose-deep">
                                50K+
                            </div>
                            <div className="text-sm text-gray-600">
                                Khách hàng
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-rose-deep">
                                100+
                            </div>
                            <div className="text-sm text-gray-600">
                                Khách sạn
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-rose-deep">
                                24/7
                            </div>
                            <div className="text-sm text-gray-600">Hỗ trợ</div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login/Register Form */}
                <div className="glass-effect rounded-3xl shadow-rose p-8 lg:p-10 animate-scale-in border border-pink-100">
                    {/* Tabs */}
                    <div className="flex bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-1 mb-8">
                        <button
                            onClick={() => {
                                setActiveTab("login");
                                resetForm();
                            }}
                            className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                                activeTab === "login"
                                    ? "bg-white text-rose-deep shadow-lg transform scale-105"
                                    : "text-gray-600 hover:text-rose-500"
                            }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("register");
                                resetForm();
                            }}
                            className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                                activeTab === "register"
                                    ? "bg-white text-rose-deep shadow-lg transform scale-105"
                                    : "text-gray-600 hover:text-rose-500"
                            }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* Forms */}
                    <form
                        onSubmit={
                            activeTab === "login" ? handleLogin : handleRegister
                        }
                    >
                        <div className="space-y-4">
                            {activeTab === "register" && (
                                <>
                                    <div className="animate-slide-down">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                            placeholder="Nhập họ và tên đầy đủ"
                                            minLength="2"
                                        />
                                    </div>
                                    <div className="animate-slide-down delay-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                            placeholder="Nhập số điện thoại"
                                            pattern="(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Định dạng: 0912345678 hoặc
                                            +84912345678
                                        </p>
                                    </div>
                                </>
                            )}

                            <div
                                className={
                                    activeTab === "register"
                                        ? "animate-slide-down delay-200"
                                        : ""
                                }
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div
                                className={
                                    activeTab === "register"
                                        ? "animate-slide-down delay-300"
                                        : ""
                                }
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                    placeholder="••••••••"
                                    minLength="6"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Mật khẩu phải có ít nhất 6 ký tự
                                </p>
                            </div>

                            {activeTab === "register" && (
                                <div className="animate-slide-down delay-400">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Xác nhận mật khẩu *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:border-rose-300"
                                        placeholder="••••••••"
                                        minLength="6"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Forgot password - chỉ hiện ở tab login */}
                        {activeTab === "login" && (
                            <div className="text-right mt-4">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-rose-deep hover:text-rose-700 transition-colors"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-8 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 group ${
                                isLoading
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:scale-105 hover:from-rose-600 hover:to-pink-700"
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {activeTab === "login"
                                            ? "Đang đăng nhập..."
                                            : "Đang đăng ký..."}
                                    </>
                                ) : (
                                    <>
                                        {activeTab === "login"
                                            ? "Đăng nhập"
                                            : "Đăng ký"}
                                        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">
                            hoặc tiếp tục với
                        </span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Terms */}
                    {activeTab === "register" && (
                        <p className="text-xs text-center text-gray-500 mt-4">
                            Bằng việc đăng ký, bạn đồng ý với{" "}
                            <Link
                                to="/terms"
                                className="text-rose-deep hover:text-rose-700"
                            >
                                Điều khoản dịch vụ
                            </Link>{" "}
                            và{" "}
                            <Link
                                to="/privacy"
                                className="text-rose-deep hover:text-rose-700"
                            >
                                Chính sách bảo mật
                            </Link>
                        </p>
                    )}
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

export default LoginPage;
