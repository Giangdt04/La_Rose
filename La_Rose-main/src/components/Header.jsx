import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
    User,
    LogOut,
    Settings,
    Heart,
    Calendar,
    ChevronDown,
    Menu,
    X,
    Home,
    BedDouble,
    BookOpen,
    Info,
} from "lucide-react";
import session from "../utils/SessionManager";

const Header = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navigate = useNavigate();

    // Mock user data
    const [userData, setUserData] = useState({
        id: 3,
        email: "ngoclanhlethi2@gmail.com",
        fullName: "Nguyen Van A",
        phone: "0123456789",
        isActive: true,
        emailVerified: false,
        lastLogin: "2025-10-25T16:23:41.5039854",
        createdAt: "2025-10-25T16:19:17",
    });

    useEffect(() => {
        const token = session.getToken();
        const userInfor = session.getUser();
        const currentPath = window.location.pathname;

        if (!token || !userInfor) {
            setIsLoggedIn(false);
            if (!currentPath.includes("/verify")) {
                navigate("/login");
            }
        } else {
            setIsLoggedIn(true);
            console.log(userInfor);
            setUserData(userInfor);
        }
    }, [navigate]);

    const navLinkClass = ({ isActive }) =>
        `nav-link transition-colors font-medium ${
            isActive ? "text-rose-600" : "text-gray-700 hover:text-rose-600"
        }`;

    const mobileNavLinkClass = ({ isActive }) =>
        `flex items-center space-x-3 py-4 px-4 text-base transition-colors font-medium border-b border-gray-100 ${
            isActive
                ? "text-rose-600 bg-rose-50 border-r-4 border-rose-600"
                : "text-gray-700 hover:text-rose-600 hover:bg-rose-50"
        }`;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setIsUserMenuOpen(false);
            }
            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target)
            ) {
                setIsNotificationsOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const handleLogin = () => {
        navigate("/login");
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleRegister = () => {
        navigate("/register");
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        session.logout();
        navigate("/login");
    };

    // Mock notifications
    const notifications = [
        {
            id: 1,
            text: "Đặt phòng thành công cho ngày 15/12",
            time: "5 phút trước",
            unread: true,
        },
        {
            id: 2,
            text: "Ưu đãi đặc biệt tháng 12",
            time: "1 giờ trước",
            unread: true,
        },
        {
            id: 3,
            text: "Cập nhật chính sách mới",
            time: "2 ngày trước",
            unread: false,
        },
    ];

    const unreadCount = notifications.filter((n) => n.unread).length;

    const getAvatarInitials = (fullName) => {
        if (!fullName) return "";
        const parts = fullName.trim().split(" ").filter(Boolean);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <>
            <header
                className={`h-16 sm:h-20 glass-effect fixed w-full top-0 z-50 shadow-sm bg-white/95 backdrop-blur-md`}
            >
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo and mobile menu button */}
                        <div className="flex items-center space-x-3">
                            {/* Logo */}
                            <Link
                                to="/"
                                className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
                            >
                                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-rose-200 group-hover:scale-105 transition-all duration-300">
                                    <i className="fas fa-bed text-white text-sm sm:text-xl"></i>
                                </div>
                                <h1
                                    className={`font-playfair text-lg sm:text-2xl font-bold text-gray-800`}
                                >
                                    La Rosé
                                </h1>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-8">
                            <NavLink to="/" className={navLinkClass}>
                                Trang chủ
                            </NavLink>
                            <NavLink to="/rooms" className={navLinkClass}>
                                Phòng
                            </NavLink>
                            <NavLink to="/about" className={navLinkClass}>
                                Giới thiệu
                            </NavLink>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 active:scale-95"
                        >
                            {isMobileMenuOpen ? (
                                <X size={22} />
                            ) : (
                                <Menu size={22} />
                            )}
                        </button>

                        {/* Right side actions */}
                        <div className="hidden lg:flex items-center space-x-1 sm:space-x-3">
                            {/* Notifications */}
                            {isLoggedIn && (
                                <div
                                    className="relative"
                                    ref={notificationsRef}
                                >

                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-scale-in">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <h3 className="font-semibold text-gray-800">
                                                    Thông báo
                                                </h3>
                                            </div>
                                            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                                                {notifications.map(
                                                    (notification) => (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            className={`px-4 py-3 hover:bg-rose-50 transition-colors ${
                                                                notification.unread
                                                                    ? "bg-rose-50/50"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <p className="text-sm text-gray-700">
                                                                {
                                                                    notification.text
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {
                                                                    notification.time
                                                                }
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            <div className="px-4 py-2 border-t border-gray-100">
                                                <button className="text-rose-600 text-sm font-medium hover:text-rose-700 transition-colors">
                                                    Xem tất cả
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* User menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() =>
                                        setIsUserMenuOpen(!isUserMenuOpen)
                                    }
                                    className={`flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl transition-all duration-300 ${
                                        isUserMenuOpen
                                            ? "bg-rose-50 border border-rose-200"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {isLoggedIn ? (
                                        <>
                                            {userData?.avatar ? (
                                                <img
                                                    src={userData?.avatar}
                                                    alt={userData?.fullName}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-rose-200"
                                                />
                                            ) : (
                                                <p className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white text-center border-2 border-rose-200">
                                                    {getAvatarInitials(
                                                        userData?.fullName,
                                                    )}
                                                </p>
                                            )}
                                            <div className="hidden sm:block text-left">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {userData?.fullName}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`hidden sm:block transition-transform duration-300 ${
                                                    isUserMenuOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </>
                                    ) : (
                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                            <User
                                                size={20}
                                                className="sm:w-5 sm:h-5 text-gray-600"
                                            />
                                            <span className="hidden sm:block font-medium text-gray-700">
                                                Tài khoản
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                className={`hidden sm:block transition-transform duration-300 ${
                                                    isUserMenuOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                    )}
                                </button>

                                {/* User dropdown menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-scale-in z-50">
                                        {isLoggedIn ? (
                                            <>
                                                {/* User info */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-3">
                                                        {userData?.avatar ? (
                                                            <img
                                                                src={
                                                                    userData?.avatar
                                                                }
                                                                alt={
                                                                    userData?.fullName
                                                                }
                                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-rose-200"
                                                            />
                                                        ) : (
                                                            <p className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-600 font-bold text-white text-center border-2 border-rose-200">
                                                                {getAvatarInitials(
                                                                    userData?.fullName,
                                                                )}
                                                            </p>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-800 truncate">
                                                                {userData.name}
                                                            </p>
                                                            <p className="text-sm text-gray-600 truncate">
                                                                {userData.email}
                                                            </p>
                                                            <span className="inline-block mt-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs rounded-full">
                                                                {
                                                                    userData.membership
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu items */}
                                                <div className="py-2">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 transition-colors"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        <User size={18} />
                                                        <span>
                                                            Thông tin tài khoản
                                                        </span>
                                                    </Link>
                                            
                                                    <Link
                                                        to="/bookings"
                                                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 transition-colors"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        <Calendar size={18} />
                                                        <span>
                                                            Lịch sử đặt phòng
                                                        </span>
                                                    </Link>
                                              
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-gray-100 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center space-x-3 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors"
                                                    >
                                                        <LogOut size={18} />
                                                        <span>Đăng xuất</span>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            /* Login/Register options */
                                            <>
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <h3 className="font-semibold text-gray-800">
                                                        Chào mừng bạn!
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Đăng nhập để trải nghiệm
                                                        tốt hơn
                                                    </p>
                                                </div>

                                                <div className="px-4 py-2">
                                                    <button
                                                        onClick={handleLogin}
                                                        className="w-full my-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                                    >
                                                        Đăng nhập
                                                    </button>

                                                    <div className="border-t border-gray-100 pt-3">
                                                        <p className="text-center text-sm text-gray-600">
                                                            Chưa có tài khoản?{" "}
                                                            <button
                                                                onClick={
                                                                    handleRegister
                                                                }
                                                                className="text-rose-600 font-semibold hover:text-rose-700"
                                                            >
                                                                Đăng ký ngay
                                                            </button>
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu */}
                        <div
                            ref={mobileMenuRef}
                            className="fixed top-0 left-0 w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in-left"
                        >
                            {/* Mobile menu header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                                        <i className="fas fa-bed text-white text-lg"></i>
                                    </div>
                                    <div>
                                        <h1 className="font-playfair text-lg font-bold text-gray-800">
                                            La Rosé
                                        </h1>
                                        <p className="text-xs text-gray-600">
                                            Khách sạn & Resort
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Mobile menu content */}
                            <div className="h-full overflow-y-auto pb-32">
                                {/* User info section */}
                                {isLoggedIn ? (
                                    <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            {userData?.avatar ? (
                                                <img
                                                    src={userData?.avatar}
                                                    alt={userData?.fullName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-200"
                                                />
                                            ) : (
                                                <p className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-600 font-bold text-white text-center border-2 border-rose-200">
                                                    {getAvatarInitials(
                                                        userData?.fullName,
                                                    )}
                                                </p>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {userData.name}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {userData.email}
                                                </p>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs rounded-full">
                                                    {userData.membership}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-200">
                                        <p className="font-semibold text-gray-800 mb-2">
                                            Chào mừng bạn!
                                        </p>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleLogin}
                                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300"
                                            >
                                                Đăng nhập
                                            </button>
                                            <button
                                                onClick={handleRegister}
                                                className="flex-1 border border-rose-500 text-rose-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-all duration-300"
                                            >
                                                Đăng ký
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation links */}
                                <nav className="py-2">
                                    <NavLink
                                        to="/"
                                        className={mobileNavLinkClass}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <Home
                                            size={20}
                                            className="text-rose-500"
                                        />
                                        <span>Trang chủ</span>
                                    </NavLink>
                                    <NavLink
                                        to="/rooms"
                                        className={mobileNavLinkClass}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <BedDouble
                                            size={20}
                                            className="text-rose-500"
                                        />
                                        <span>Phòng & Suite</span>
                                    </NavLink>
                                    <NavLink
                                        to="/about"
                                        className={mobileNavLinkClass}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <Info
                                            size={20}
                                            className="text-rose-500"
                                        />
                                        <span>Giới thiệu</span>
                                    </NavLink>
                                </nav>

                                {/* User menu items for mobile */}
                                {isLoggedIn && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="px-4 py-2">
                                            <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">
                                                Tài khoản
                                            </h3>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:bg-rose-50 transition-colors border-b border-gray-100"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <User size={18} />
                                            <span className="text-sm">
                                                Thông tin tài khoản
                                            </span>
                                        </Link>
                                        <Link
                                            to="/favorites"
                                            className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:bg-rose-50 transition-colors border-b border-gray-100"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Heart size={18} />
                                            <span className="text-sm">
                                                Phòng yêu thích
                                            </span>
                                        </Link>
                                        <Link
                                            to="/bookings"
                                            className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:bg-rose-50 transition-colors border-b border-gray-100"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Calendar size={18} />
                                            <span className="text-sm">
                                                Lịch sử đặt phòng
                                            </span>
                                        </Link>
                                
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-3 w-full py-3 px-4 text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            <span className="text-sm">
                                                Đăng xuất
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {/* Contact info */}
                                <div className="mt-8 px-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-800 text-sm mb-2">
                                            Liên hệ
                                        </h4>
                                        <p className="text-xs text-gray-600 mb-1">
                                            📞 0123 456 789
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            ✉️ info@larose.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Add space for fixed header */}
            <div className="h-16 sm:h-20"></div>

            {/* Add custom animations */}
            <style>{`
                @keyframes slide-in-left {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-slide-in-left {
                    animation: slide-in-left 0.3s ease-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default Header;
