import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    Home,
    User,
    ShieldCheck,
    RefreshCw,
    Check,
} from "lucide-react";
import authService from "../services/auth.service";

const EmailVerificationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, verifying, success, error
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const verifyEmail = async () => {
        const token = searchParams.get("token");

        if (!token) {
            setVerificationStatus("error");
            setErrorMessage("Token xác thực không tồn tại");
            toast.error("❌ Token xác thực không tồn tại!", {
                position: "top-right",
            });
            return;
        }

        try {
            setIsLoading(true);
            setVerificationStatus("verifying");

            const response = await authService.verifyEmail(token);
            console.log("Verification response:", response);

            // Dựa vào response từ backend để xác định trạng thái
            if (response.status === 200) {
                setVerificationStatus("success");
                setSuccessMessage(
                    response.data?.message || "Xác thực email thành công!",
                );

                toast.success("✅ Xác thực email thành công!", {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else if (response.status === 400) {
                setVerificationStatus("error");
                setErrorMessage(
                    response.data?.message ||
                        "Token không hợp lệ hoặc đã hết hạn.",
                );

                toast.error(
                    `❌ ${response.data?.message || "Token không hợp lệ!"}`,
                    {
                        position: "top-right",
                    },
                );
            } else {
                setVerificationStatus("error");
                setErrorMessage(
                    response.data?.message ||
                        "Xác thực thất bại. Vui lòng thử lại.",
                );

                toast.error(
                    `❌ ${response.data?.message || "Xác thực thất bại!"}`,
                    {
                        position: "top-right",
                    },
                );
            }
        } catch (error) {
            console.error("Email verification error:", error);
            setVerificationStatus("error");

            // Xử lý lỗi từ response
            if (error.response) {
                const errorData = error.response.data;
                if (errorData.message) {
                    setErrorMessage(errorData.message);
                } else if (errorData.error === "BAD_REQUEST") {
                    setErrorMessage("Token không hợp lệ hoặc đã hết hạn.");
                } else if (errorData.error === "INTERNAL_SERVER_ERROR") {
                    setErrorMessage("Lỗi hệ thống. Vui lòng thử lại sau.");
                } else {
                    setErrorMessage("Xác thực thất bại. Vui lòng thử lại.");
                }
            } else {
                setErrorMessage(
                    error.message || "Xác thực thất bại. Vui lòng thử lại.",
                );
            }

            toast.error(`❌ ${error.message || "Xác thực thất bại!"}`, {
                position: "top-right",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateToLogin = () => {
        navigate("/login");
    };

    const handleNavigateToHome = () => {
        navigate("/");
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
                <div className="max-w-2xl mx-auto">
                    {/* Main Content */}
                    <div className="glass-effect rounded-3xl shadow-rose p-8 border border-pink-100">
                        {/* Verification Status */}
                        <div className="text-center">
                            {verificationStatus === "pending" ? (
                                <div className="animate-fade-in-up">
                                    <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Mail className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        Xác Thực Email
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Nhấn nút bên dưới để xác thực địa chỉ
                                        email của bạn. Liên kết xác thực sẽ được
                                        kích hoạt khi bạn nhấn nút.
                                    </p>
                                    <button
                                        onClick={verifyEmail}
                                        className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105 mx-auto"
                                        disabled={isLoading}
                                    >
                                        <Check className="w-5 h-5" />
                                        {isLoading
                                            ? "Đang xác thực..."
                                            : "Xác thực Email"}
                                    </button>
                                </div>
                            ) : verificationStatus === "verifying" ? (
                                <div className="animate-fade-in-up">
                                    <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Clock className="w-10 h-10 text-white animate-pulse" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        Đang xác thực...
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Vui lòng chờ trong giây lát trong khi
                                        chúng tôi xác thực email của bạn.
                                    </p>
                                    <div className="flex justify-center">
                                        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                </div>
                            ) : verificationStatus === "success" ? (
                                <div className="animate-fade-in-up">
                                    <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        Xác Thực Thành Công!
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        {successMessage ||
                                            "Email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ các tính năng của hệ thống."}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={handleNavigateToLogin}
                                            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                                        >
                                            <User className="w-5 h-5" />
                                            Đăng nhập ngay
                                        </button>
                                        <button
                                            onClick={handleNavigateToHome}
                                            className="flex items-center gap-2 bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                                        >
                                            <Home className="w-5 h-5" />
                                            Về trang chủ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in-up">
                                    <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <XCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        Xác Thực Thất Bại
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {errorMessage ||
                                            "Đã xảy ra lỗi trong quá trình xác thực. Token có thể không hợp lệ hoặc đã hết hạn."}
                                    </p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            <div className="text-sm text-yellow-800">
                                                <p className="font-semibold">
                                                    Gợi ý khắc phục:
                                                </p>
                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                    <li>
                                                        Kiểm tra lại liên kết
                                                        xác thực trong email
                                                    </li>
                                                    <li>
                                                        Yêu cầu gửi lại email
                                                        xác thực mới
                                                    </li>
                                                    <li>
                                                        Liên hệ hỗ trợ nếu vấn
                                                        đề tiếp diễn
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={verifyEmail}
                                            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Thử lại
                                        </button>
                                        <button
                                            onClick={handleNavigateToHome}
                                            className="flex items-center gap-2 bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                                        >
                                            <Home className="w-5 h-5" />
                                            Về trang chủ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Information */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                Thông tin hữu ích
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                    <Mail className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                                    <div className="text-sm font-semibold text-gray-700">
                                        Kiểm tra hộp thư
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Đảm bảo kiểm tra cả thư mục spam
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                                    <div className="text-sm font-semibold text-gray-700">
                                        Bảo mật
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Bảo vệ tài khoản của bạn
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                    <Clock className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                                    <div className="text-sm font-semibold text-gray-700">
                                        Nhanh chóng
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Chỉ mất vài giây
                                    </div>
                                </div>
                            </div>
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

export default EmailVerificationPage;
