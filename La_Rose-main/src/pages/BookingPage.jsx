import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import { useMemo } from "react";
import bookingService from "../services/booking.service";
import session from "../utils/SessionManager";

const DEPOSIT_PERCENTAGE = 0.2; // Đặt cọc 20%

// Hàm kiểm tra định dạng email
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Hàm kiểm tra định dạng số điện thoại
const isValidPhone = (phone) => {
    return /^\d{9,15}$/.test(phone);
};

// Component hiển thị xác nhận đặt phòng thành công
const ConfirmationContent = ({ bookingInfo, onResetBooking }) => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleNewBooking = () => {
        onResetBooking();
    };

    return (
        <div className="container mx-auto px-6 py-12 font-inter text-center min-h-full bg-white">
            <div className="max-w-2xl mx-auto p-8 transform transition-all">
                {/* Icon thành công */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-12 h-12 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                </div>

                {/* Tiêu đề */}
                <h3 className="text-3xl font-bold text-green-700 mb-4">
                    {bookingInfo.paymentMethod === "cash"
                        ? "Đặt Phòng Thành Công!"
                        : "Đặt Phòng & Thanh Toán Thành Công!"}
                </h3>

                {/* Thông điệp */}
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    {bookingInfo.paymentMethod === "cash"
                        ? "Cảm ơn quý khách đã lựa chọn La Rosé. Đơn đặt phòng của quý khách đã được xác nhận. Vui lòng đến khách sạn để hoàn tất thủ tục thanh toán."
                        : "Cảm ơn quý khách đã lựa chọn La Rosé. Đơn đặt phòng của quý khách đã được xác nhận và thanh toán thành công. Chúng tôi rất mong được đón tiếp quý khách."}
                </p>

                {/* Thông tin đặt phòng */}
                {bookingInfo && (
                    <div className="bg-white border border-green-200 rounded-xl p-6 mb-8 shadow-sm">
                        <h4 className="font-semibold text-green-800 text-lg mb-4">
                            Thông tin đặt phòng
                        </h4>
                        <div className="space-y-3 text-left">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Mã đặt phòng:
                                </span>
                                <span className="font-semibold">
                                    #{bookingInfo.bookingId}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phòng:</span>
                                <span className="font-semibold">
                                    {bookingInfo.roomType}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số phòng:</span>
                                <span className="font-semibold">
                                    {bookingInfo.roomNumber}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Ngày nhận phòng:
                                </span>
                                <span className="font-semibold">
                                    {bookingInfo.checkin}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Ngày trả phòng:
                                </span>
                                <span className="font-semibold">
                                    {bookingInfo.checkout}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Khách hàng:
                                </span>
                                <span className="font-semibold">
                                    {bookingInfo.customer}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Phương thức thanh toán:
                                </span>
                                <span className="font-semibold">
                                    {bookingInfo.paymentMethod === "cash"
                                        ? "Thanh toán tại quầy"
                                        : "VNPay"}
                                </span>
                            </div>
                            <div className="border-t pt-3 mt-3">
                                {bookingInfo.paymentMethod === "cash" ? (
                                    <>
                                        <div className="flex justify-between text-lg">
                                            <span className="text-gray-700">
                                                Số tiền cần thanh toán tại quầy:
                                            </span>
                                            <span className="font-bold text-amber-600">
                                                {bookingInfo.amountToPay?.toLocaleString()}
                                                ₫
                                            </span>
                                        </div>
                                        {bookingInfo.paymentOption ===
                                            "deposit" && (
                                            <div className="flex justify-between text-sm mt-2">
                                                <span className="text-gray-500">
                                                    Số tiền còn lại (thanh toán
                                                    khi nhận phòng):
                                                </span>
                                                <span className="text-gray-600">
                                                    {bookingInfo.remainingDue?.toLocaleString()}
                                                    ₫
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-lg">
                                            <span className="text-gray-700">
                                                Số tiền đã thanh toán:
                                            </span>
                                            <span className="font-bold text-green-600">
                                                {bookingInfo.amountPaid?.toLocaleString()}
                                                ₫
                                            </span>
                                        </div>
                                        {bookingInfo.remainingDue > 0 && (
                                            <div className="flex justify-between text-sm mt-2">
                                                <span className="text-gray-500">
                                                    Số tiền còn lại:
                                                </span>
                                                <span className="text-gray-600">
                                                    {bookingInfo.remainingDue?.toLocaleString()}
                                                    ₫
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Hướng dẫn đặc biệt cho thanh toán tại quầy */}
                {bookingInfo.paymentMethod === "cash" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-6 h-6 text-yellow-600 mt-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                    Hướng dẫn thanh toán tại quầy
                                </h3>
                                <ul className="text-yellow-700 text-sm space-y-2 text-left">
                                    <li>
                                        • Vui lòng đến trực tiếp khách sạn La
                                        Rosé để hoàn tất thủ tục thanh toán
                                    </li>
                                    <li>
                                        • Mang theo CMND/CCCD để xác minh thông
                                        tin
                                    </li>
                                    <li>
                                        • Phòng sẽ được giữ đến 18:00 ngày nhận
                                        phòng
                                    </li>
                                    <li>
                                        • Địa chỉ: 123 Đường ABC, Quận XYZ, TP.
                                        Hồ Chí Minh
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hướng dẫn tiếp theo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-blue-700">
                        📧 Thông tin xác nhận đã được gửi đến email của quý
                        khách. Vui lòng kiểm tra hộp thư đến và thư rác (spam)
                        để biết chi tiết.
                    </p>
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleBackToHome}
                        className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                    >
                        Về Trang Chủ
                    </button>
                    <button
                        onClick={handleNewBooking}
                        className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors shadow-md transform hover:scale-[1.02]"
                    >
                        Đặt Phòng Mới
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component xử lý callback từ VNPay
const VNPayCallbackHandler = ({ onSuccess, onError }) => {
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processVNPayCallback = async () => {
            try {
                console.log("Processing VNPay callback...");

                // Lấy các tham số từ URL
                const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
                const vnp_TransactionStatus = searchParams.get(
                    "vnp_TransactionStatus",
                );
                const vnp_Amount = searchParams.get("vnp_Amount");
                const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
                const vnp_BankCode = searchParams.get("vnp_BankCode");

                console.log("VNPay callback params:", {
                    vnp_ResponseCode,
                    vnp_TransactionStatus,
                    vnp_Amount,
                    vnp_OrderInfo,
                    vnp_BankCode,
                });

                // Kiểm tra kết quả thanh toán
                if (
                    vnp_ResponseCode === "00" ||
                    vnp_TransactionStatus === "00"
                ) {
                    // Thanh toán thành công
                    console.log("VNPay payment successful");

                    // Tạo thông tin booking tạm thời từ thông tin có sẵn
                    const tempBookingInfo = {
                        bookingId:
                            vnp_OrderInfo ||
                            `BK${Date.now().toString().slice(-8)}`,
                        roomType: "Phòng Deluxe", // Có thể lấy từ localStorage hoặc context
                        roomNumber: "001",
                        checkin: new Date().toISOString().split("T")[0],
                        checkout: new Date(Date.now() + 86400000)
                            .toISOString()
                            .split("T")[0],
                        customer: session.getUser()?.fullName || "Khách hàng",
                        amountPaid: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0,
                        remainingDue: 0,
                        paymentMethod: "vnpay",
                        paymentOption: "full",
                    };

                    onSuccess(tempBookingInfo);
                } else {
                    // Thanh toán thất bại
                    throw new Error(
                        `Thanh toán VNPay thất bại. Mã lỗi: ${vnp_ResponseCode}`,
                    );
                }
            } catch (error) {
                console.error("Error processing VNPay callback:", error);
                onError(error.message);
            } finally {
                setIsProcessing(false);
            }
        };

        processVNPayCallback();
    }, [searchParams, onSuccess, onError]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Đang xử lý kết quả thanh toán...
                </h3>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
};

// Component chính cho trang đặt phòng
const BookingPage = () => {
    const { addBooking } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State quản lý luồng ứng dụng
    const [step, setStep] = useState(1);
    const [confirmedBookingInfo, setConfirmedBookingInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isProcessingVNPayCallback, setIsProcessingVNPayCallback] =
        useState(false);

    // Kiểm tra nếu đang xử lý callback từ VNPay
    useEffect(() => {
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        if (vnp_ResponseCode) {
            console.log("Detected VNPay callback, processing...");
            setIsProcessingVNPayCallback(true);
        }
    }, [searchParams]);

    // Ngày mặc định
    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const todayDefault = todayDate.toISOString().split("T")[0];
    const tomorrowDefault = tomorrowDate.toISOString().split("T")[0];

    // Dữ liệu từ RoomsPage (nếu có)
    const preFilledData = location.state?.preFilledData;
    const fromRoomPage = location.state?.fromRoomPage;

    // Lấy thông tin user từ session
    useEffect(() => {
        const user = session.getUser();
        if (user) {
            setCurrentUser(user);
            console.log("User info loaded from session:", user);
        } else {
            console.warn("No user found in session");
        }
    }, [navigate]);

    // Khởi tạo dữ liệu đặt phòng với thông tin user
    const initialBookingData = {
        // Thông tin phòng
        roomType: preFilledData?.roomType?.toLowerCase() || "deluxe",
        roomId: preFilledData?.roomId || null,
        roomTitle: preFilledData?.roomTitle || "",
        roomNumber: preFilledData?.roomNumber || "",
        roomDescription: preFilledData?.roomDescription || "",
        roomArea: preFilledData?.roomArea || "",
        roomCapacity: preFilledData?.roomCapacity || 2,
        quantity: 1,

        // Thời gian
        checkin: todayDefault,
        checkout: tomorrowDefault,

        // Thông tin khách hàng - TỰ ĐỘNG ĐIỀN TỪ USER
        name: "",
        phone: "",
        email: "",
        requests: "",

        // Thanh toán
        paymentMethod: "vnpay",
        paymentOption: "full",
    };

    const [bookingData, setBookingData] = useState(initialBookingData);

    // Cập nhật booking data khi user data thay đổi
    useEffect(() => {
        if (currentUser) {
            setBookingData((prev) => ({
                ...prev,
                name: currentUser.fullName || "",
                phone: currentUser.phone || "",
                email: currentUser.email || "",
            }));
        }
    }, [currentUser]);

    const [totalPrice, setTotalPrice] = useState(0);

    // Tính toán tổng tiền
    useEffect(() => {
        const { quantity, checkin, checkout } = bookingData;

        let nights = 1;
        if (checkin && checkout) {
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const diffTime = Math.abs(checkoutDate - checkinDate);
            nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        const roomPrice = preFilledData?.price || 2500000; // Giá mặc định
        setTotalPrice(roomPrice * quantity * nights);
    }, [
        bookingData.roomType,
        bookingData.quantity,
        bookingData.checkin,
        bookingData.checkout,
        preFilledData,
    ]);

    // Tính toán các khoản thanh toán
    const { depositAmount, remainingAmount, amountToPay } = useMemo(() => {
        const calculatedDepositAmount = Math.round(
            totalPrice * DEPOSIT_PERCENTAGE,
        );
        const calculatedRemainingAmount = totalPrice - calculatedDepositAmount;

        const finalAmountToPay =
            bookingData.paymentOption === "full"
                ? totalPrice
                : calculatedDepositAmount;

        return {
            depositAmount: calculatedDepositAmount,
            remainingAmount: calculatedRemainingAmount,
            amountToPay: finalAmountToPay,
        };
    }, [totalPrice, bookingData.paymentOption]);

    // Xử lý thay đổi form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingData((prev) => ({ ...prev, [name]: value }));
        setErrorMessage("");
    };

    // Validation cho từng bước
    const validateStep1 = () => {
        if (!bookingData.checkin || !bookingData.checkout) {
            return "Vui lòng chọn ngày nhận và trả phòng.";
        }

        const checkinDate = new Date(bookingData.checkin);
        const checkoutDate = new Date(bookingData.checkout);

        if (checkinDate >= checkoutDate) {
            return "Ngày trả phòng phải sau ngày nhận phòng.";
        }

        if (checkinDate < new Date().setHours(0, 0, 0, 0)) {
            return "Ngày nhận phòng không thể là ngày trong quá khứ.";
        }

        return null;
    };

    const validateStep2 = () => {
        if (!bookingData.name.trim()) {
            return "Vui lòng nhập họ và tên.";
        }

        if (!bookingData.phone.trim()) {
            return "Vui lòng nhập số điện thoại.";
        }

        if (!isValidPhone(bookingData.phone)) {
            return "Số điện thoại không hợp lệ. Vui lòng nhập 9-15 chữ số.";
        }

        if (!bookingData.email.trim()) {
            return "Vui lòng nhập địa chỉ email.";
        }

        if (!isValidEmail(bookingData.email)) {
            return "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.";
        }

        return null;
    };

    // Chuyển bước tiếp theo
    const nextStep = () => {
        setErrorMessage("");

        let validationError = null;

        if (step === 1) {
            validationError = validateStep1();
        } else if (step === 2) {
            validationError = validateStep2();
        }

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setStep((s) => s + 1);
    };

    // Quay lại bước trước
    const prevStep = () => {
        setErrorMessage("");
        setStep((s) => s - 1);
    };

    // Reset booking
    const resetBooking = () => {
        setConfirmedBookingInfo(null);
        setBookingData(initialBookingData);
        setStep(1);
        setErrorMessage("");
    };

    // Xử lý callback từ VNPay thành công
    const handleVNPayCallbackSuccess = (bookingInfo) => {
        console.log("VNPay callback success:", bookingInfo);
        setConfirmedBookingInfo(bookingInfo);
        setIsProcessingVNPayCallback(false);

        // Thêm booking vào context
        addBooking(bookingInfo);
    };

    // Xử lý callback từ VNPay thất bại
    const handleVNPayCallbackError = (error) => {
        console.error("VNPay callback error:", error);
        setErrorMessage(error);
        setIsProcessingVNPayCallback(false);
    };

    // Xử lý thanh toán VNPay
    const handleVNPayPayment = async (bookingPayload) => {
        try {
            // Tạo orderInfo đơn giản, không có ký tự đặc biệt
            const safeOrderInfo = `Booking${bookingPayload.roomId}${Date.now()
                .toString()
                .slice(-6)}`;

            const vnpayData = {
                amount: amountToPay,
                orderInfo: safeOrderInfo,
                roomId: bookingPayload.roomId || 1,
                returnUrl: `${window.location.origin}${window.location.pathname}`,
            };

            console.log("Sending VNPay request:", vnpayData);

            const vnpayResponse = await bookingService.submitVNPayOrder(
                vnpayData,
            );

            console.log("VNPay API response:", vnpayResponse);

            // Xử lý nhiều định dạng response khác nhau
            let paymentUrl = null;

            if (
                typeof vnpayResponse === "string" &&
                vnpayResponse.startsWith("http")
            ) {
                // Trường hợp response là URL string
                paymentUrl = vnpayResponse;
            } else if (vnpayResponse.paymentUrl) {
                // Trường hợp có field paymentUrl
                paymentUrl = vnpayResponse.paymentUrl;
            } else if (vnpayResponse.data && vnpayResponse.data.paymentUrl) {
                // Trường hợp nested data
                paymentUrl = vnpayResponse.data.paymentUrl;
            } else if (vnpayResponse.url) {
                // Trường hợp có field url
                paymentUrl = vnpayResponse.url;
            } else if (vnpayResponse.vnpUrl) {
                // Trường hợp có field vnpUrl
                paymentUrl = vnpayResponse.vnpUrl;
            }

            if (paymentUrl) {
                console.log("Redirecting to VNPay:", paymentUrl);
                // Chuyển hướng đến VNPay
                window.location.href = paymentUrl;
            } else {
                console.error(
                    "No payment URL found in response:",
                    vnpayResponse,
                );
                throw new Error(
                    "Không nhận được URL thanh toán từ VNPay. Vui lòng thử lại.",
                );
            }
        } catch (error) {
            console.error("Lỗi thanh toán VNPay:", error);
            throw new Error("Thanh toán VNPay thất bại: " + error.message);
        }
    };

    // Xử lý thanh toán tại quầy
    const handleCashPayment = async (bookingPayload) => {
        try {
            // Xác định trạng thái thanh toán
            let paymentStatus = "pending";
            let transactionStatus = "PENDING";

            if (bookingData.paymentOption === "full") {
                paymentStatus = "pending";
            } else {
                paymentStatus = "deposit_pending";
            }

            // Tạo transaction data
            const transactionData = {
                userId: currentUser?.id || 3,
                provider: "CASH",
                providerTransactionId: `CASH${Date.now()}`,
                amount: amountToPay,
                currency: "VND",
                status: transactionStatus,
                type: "PAYMENT",
                metadata: JSON.stringify({
                    note: `Payment at counter for booking ${bookingPayload.id}`,
                    customerName: bookingData.name,
                    customerPhone: bookingData.phone,
                    paymentOption: bookingData.paymentOption,
                    amountToPay: amountToPay,
                    totalPrice: totalPrice,
                    checkin: bookingData.checkin,
                    checkout: bookingData.checkout,
                    userId: currentUser?.id,
                }),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                bookingDTO: {
                    roomCode: bookingPayload.roomNumber || "001",
                    userEmail: bookingData.email,
                    checkIn: bookingData.checkin,
                    checkOut: bookingData.checkout,
                    nights: Math.ceil(
                        (new Date(bookingData.checkout) -
                            new Date(bookingData.checkin)) /
                            (1000 * 60 * 60 * 24),
                    ),
                    guests: bookingData.roomCapacity || 2,
                    priceTotal: totalPrice,
                    depositAmount: depositAmount,
                    status: paymentStatus,
                    roomId: bookingData.roomId || 1,
                    userId: currentUser?.id || 3,
                },
            };

            // Gọi API tạo transaction cho thanh toán tại quầy
            const transactionResponse = await bookingService.createTransaction(
                transactionData,
            );
            console.log("Cash transaction created:", transactionResponse);

            return transactionResponse;
        } catch (error) {
            console.error(
                "Lỗi khi tạo transaction thanh toán tại quầy:",
                error,
            );
            throw new Error(
                "Tạo đơn đặt phòng thanh toán tại quầy thất bại: " +
                    error.message,
            );
        }
    };

    // Xử lý submit đặt phòng với API
    const handleBookingSubmit = async () => {
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            // Kiểm tra user đã đăng nhập chưa
            if (!currentUser) {
                throw new Error("Vui lòng đăng nhập để đặt phòng.");
            }

            // Validation cuối cùng
            if (!bookingData.paymentMethod) {
                throw new Error("Vui lòng chọn phương thức thanh toán.");
            }

            // Kiểm tra tính khả dụng của phòng
            let isRoomAvailable = true;
            try {
                if (bookingData.roomId) {
                    isRoomAvailable =
                        await bookingService.checkRoomAvailability(
                            bookingData.roomId,
                            bookingData.checkin,
                            bookingData.checkout,
                        );
                }
            } catch (availabilityError) {
                console.warn(
                    "Không thể kiểm tra tính khả dụng phòng:",
                    availabilityError,
                );
                isRoomAvailable = true;
            }

            if (!isRoomAvailable) {
                throw new Error(
                    "Loại phòng này tạm thời không còn phòng trống. Vui lòng chọn loại phòng khác hoặc thử lại sau.",
                );
            }

            // Tạo booking ID
            const bookingId = "BK" + Date.now().toString().slice(-8);

            // Xác định trạng thái thanh toán dựa trên phương thức
            let paymentStatus = "confirmed";
            let amountPaid = amountToPay;
            let remainingDue = remainingAmount;

            if (bookingData.paymentMethod === "cash") {
                if (bookingData.paymentOption === "full") {
                    paymentStatus = "pending";
                    amountPaid = 0;
                    remainingDue = totalPrice;
                } else {
                    paymentStatus = "deposit_pending";
                    amountPaid = 0;
                    remainingDue = totalPrice;
                }
            } else {
                // VNPay
                paymentStatus =
                    bookingData.paymentOption === "full"
                        ? "confirmed"
                        : "deposit_paid";
            }

            // Tạo payload cho booking
            const newBookingPayload = {
                id: bookingId,
                customer: bookingData.name.trim(),
                roomType: preFilledData?.roomType || "Deluxe",
                roomNumber: bookingData.roomNumber || "001",
                roomId: bookingData.roomId || 1,
                checkin: bookingData.checkin,
                checkout: bookingData.checkout,
                dates: `${bookingData.checkin} - ${bookingData.checkout}`,
                total: totalPrice,
                amountPaid: amountPaid,
                remainingDue: remainingDue,
                paymentMethod: bookingData.paymentMethod,
                paymentOption: bookingData.paymentOption,
                status: paymentStatus,
                customerPhone: bookingData.phone,
                customerEmail: bookingData.email,
                specialRequests: bookingData.requests,
                bookingDate: new Date().toISOString().split("T")[0],
                nights: Math.ceil(
                    (new Date(bookingData.checkout) -
                        new Date(bookingData.checkin)) /
                        (1000 * 60 * 60 * 24),
                ),
                roomTitle:
                    bookingData.roomTitle ||
                    preFilledData?.roomTitle ||
                    "Phòng Deluxe",
                roomDescription:
                    bookingData.roomDescription ||
                    preFilledData?.roomDescription ||
                    "Phòng sang trọng",
                roomArea:
                    bookingData.roomArea || preFilledData?.roomArea || "30",
                roomCapacity:
                    bookingData.roomCapacity ||
                    preFilledData?.roomCapacity ||
                    2,
                userId: currentUser.id, // Thêm userId từ currentUser
            };

            // Xử lý thanh toán dựa trên phương thức
            if (bookingData.paymentMethod === "vnpay") {
                await handleVNPayPayment(newBookingPayload);
                return; // Dừng lại ở đây vì sẽ chuyển hướng đến VNPay
            } else if (bookingData.paymentMethod === "cash") {
                // Xử lý thanh toán tại quầy
                await handleCashPayment(newBookingPayload);

                // Thêm booking vào hệ thống local context
                addBooking(newBookingPayload);

                console.log(
                    "Đặt phòng thanh toán tại quầy thành công:",
                    newBookingPayload,
                );

                // Hiển thị xác nhận với thông tin đầy đủ
                setConfirmedBookingInfo({
                    bookingId: newBookingPayload.id,
                    roomType: newBookingPayload.roomType,
                    roomNumber: newBookingPayload.roomNumber,
                    checkin: newBookingPayload.checkin,
                    checkout: newBookingPayload.checkout,
                    customer: newBookingPayload.customer,
                    amountPaid: newBookingPayload.amountPaid,
                    amountToPay: amountToPay,
                    remainingDue: newBookingPayload.remainingDue,
                    paymentMethod: "cash",
                    paymentOption: newBookingPayload.paymentOption,
                });
            }
        } catch (error) {
            console.error("Lỗi khi đặt phòng:", error);
            setErrorMessage(
                error.message ||
                    "Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    // Hiển thị progress steps
    const steps = [
        { number: 1, title: "Chọn Phòng & Ngày" },
        { number: 2, title: "Thông Tin Cá Nhân" },
        { number: 3, title: "Thanh Toán" },
    ];

    // Tên loại phòng để hiển thị
    const getRoomTypeName = () => {
        if (preFilledData?.roomType) {
            return preFilledData.roomType;
        }

        const roomTypeNames = {
            deluxe: "Phòng Deluxe",
            suite: "Phòng Suite",
            honeymoon: "Phòng Honeymoon",
            standard: "Phòng Tiêu chuẩn",
        };
        return roomTypeNames[bookingData.roomType] || "Phòng Deluxe";
    };

    // Mô tả phòng để hiển thị
    const getRoomDescription = () => {
        if (preFilledData?.roomDescription) {
            return preFilledData.roomDescription;
        }

        const roomDescriptions = {
            deluxe: "Phòng sang trọng với đầy đủ tiện nghi cao cấp",
            suite: "Phòng suite rộng rãi với view thành phố tuyệt đẹp",
            honeymoon: "Phòng đặc biệt dành cho tuần trăng mật",
            standard: "Phòng tiêu chuẩn với giá cả phải chăng",
        };
        return (
            roomDescriptions[bookingData.roomType] ||
            "Phòng sang trọng với đầy đủ tiện nghi"
        );
    };

    // Nếu đang xử lý callback từ VNPay, hiển thị component xử lý callback
    if (isProcessingVNPayCallback) {
        return (
            <VNPayCallbackHandler
                onSuccess={handleVNPayCallbackSuccess}
                onError={handleVNPayCallbackError}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-inter">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Đặt Phòng
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Trải nghiệm dịch vụ đẳng cấp tại La Rosé
                    </p>

                    {/* Hiển thị thông tin user */}
                    {currentUser && (
                        <div className="max-w-4xl mx-auto mb-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-blue-500 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-blue-700 text-sm">
                                    Đang đặt phòng với tư cách:{" "}
                                    <strong>{currentUser.fullName}</strong> (
                                    {currentUser.email})
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((stepItem, index) => (
                            <div
                                key={stepItem.number}
                                className="flex items-center"
                            >
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                        step >= stepItem.number
                                            ? "bg-rose-600 border-rose-600 text-white"
                                            : "border-gray-300 text-gray-500"
                                    } font-semibold`}
                                >
                                    {stepItem.number}
                                </div>
                                <span
                                    className={`ml-2 font-medium ${
                                        step >= stepItem.number
                                            ? "text-rose-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {stepItem.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-16 h-1 mx-4 ${
                                            step > stepItem.number
                                                ? "bg-rose-600"
                                                : "bg-gray-300"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thông báo từ RoomsPage */}
                {fromRoomPage && preFilledData && (
                    <div className="max-w-4xl mx-auto mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                            <svg
                                className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <span className="text-green-700 font-medium">
                                    Đang đặt phòng:{" "}
                                    <strong>
                                        {preFilledData.roomTitle ||
                                            getRoomTypeName()}
                                    </strong>
                                </span>
                                {preFilledData.price && (
                                    <span className="text-green-600 ml-2">
                                        - {preFilledData.price.toLocaleString()}
                                        ₫/đêm
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {confirmedBookingInfo ? (
                        <ConfirmationContent
                            bookingInfo={confirmedBookingInfo}
                            onResetBooking={resetBooking}
                        />
                    ) : (
                        <div className="p-8">
                            {/* Error Message */}
                            {errorMessage && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-red-500 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-red-700 font-medium">
                                            {errorMessage}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Room Selection */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                        Chọn Phòng & Thời Gian
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Lựa chọn loại phòng và thời gian lưu trú
                                        phù hợp với nhu cầu của bạn
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Loại phòng */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Loại phòng *
                                            </label>
                                            <select
                                                name="roomType"
                                                value={bookingData.roomType}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                                disabled={fromRoomPage}
                                            >
                                                <option value="standard">
                                                    Phòng Tiêu chuẩn -
                                                    1,800,000₫/đêm
                                                </option>
                                                <option value="deluxe">
                                                    Phòng Deluxe -
                                                    2,500,000₫/đêm
                                                </option>
                                                <option value="honeymoon">
                                                    Phòng Honeymoon -
                                                    3,800,000₫/đêm
                                                </option>
                                                <option value="suite">
                                                    Phòng Suite - 4,500,000₫/đêm
                                                </option>
                                            </select>
                                            {fromRoomPage && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Loại phòng đã được chọn từ
                                                    danh sách
                                                </p>
                                            )}
                                        </div>

                                        {/* Số lượng phòng */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số lượng phòng *
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={bookingData.quantity}
                                                onChange={handleChange}
                                                min="1"
                                                max="5"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                            />
                                        </div>

                                        {/* Ngày nhận phòng */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ngày nhận phòng *
                                            </label>
                                            <input
                                                type="date"
                                                name="checkin"
                                                value={bookingData.checkin}
                                                onChange={handleChange}
                                                min={today}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                            />
                                        </div>

                                        {/* Ngày trả phòng */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ngày trả phòng *
                                            </label>
                                            <input
                                                type="date"
                                                name="checkout"
                                                value={bookingData.checkout}
                                                onChange={handleChange}
                                                min={
                                                    bookingData.checkin || today
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Thông tin phòng */}
                                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            {getRoomTypeName()}
                                        </h4>
                                        <p className="text-gray-600 text-sm">
                                            {getRoomDescription()}
                                        </p>
                                        {bookingData.roomArea && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                Diện tích:{" "}
                                                {bookingData.roomArea}m²
                                            </p>
                                        )}
                                        {bookingData.roomCapacity && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                Sức chứa:{" "}
                                                {bookingData.roomCapacity} người
                                            </p>
                                        )}
                                    </div>

                                    {/* Tổng chi phí */}
                                    <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-rose-700">
                                                    Tổng chi phí dự kiến
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {bookingData.quantity} phòng
                                                    ×{" "}
                                                    {(
                                                        totalPrice /
                                                        bookingData.quantity /
                                                        Math.ceil(
                                                            (new Date(
                                                                bookingData.checkout,
                                                            ) -
                                                                new Date(
                                                                    bookingData.checkin,
                                                                )) /
                                                                (1000 *
                                                                    60 *
                                                                    60 *
                                                                    24),
                                                        )
                                                    ).toLocaleString()}
                                                    ₫/đêm ×{" "}
                                                    {Math.ceil(
                                                        (new Date(
                                                            bookingData.checkout,
                                                        ) -
                                                            new Date(
                                                                bookingData.checkin,
                                                            )) /
                                                            (1000 *
                                                                60 *
                                                                60 *
                                                                24),
                                                    )}{" "}
                                                    đêm
                                                </p>
                                            </div>
                                            <span className="text-2xl font-bold text-amber-600">
                                                {totalPrice.toLocaleString()}₫
                                            </span>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <button
                                        onClick={nextStep}
                                        className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-semibold shadow-md hover:shadow-lg mt-4"
                                    >
                                        Tiếp Tục - Thông Tin Cá Nhân
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Customer Information */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                        Thông Tin Cá Nhân
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Vui lòng cung cấp thông tin liên hệ để
                                        chúng tôi xác nhận đặt phòng
                                    </p>

                                    {/* Thông báo tự động điền */}
                                    {currentUser && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 text-green-500 mr-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-green-700 text-sm">
                                                    Thông tin đã được tự động
                                                    điền từ tài khoản của bạn
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Họ và tên */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Họ và tên *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={bookingData.name}
                                                onChange={handleChange}
                                                placeholder="Nguyễn Văn A"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                            />
                                            {currentUser &&
                                                bookingData.name ===
                                                    currentUser.fullName && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        ✓ Tự động điền từ tài
                                                        khoản
                                                    </p>
                                                )}
                                        </div>

                                        {/* Số điện thoại */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={bookingData.phone}
                                                onChange={handleChange}
                                                placeholder="0912345678"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                            />
                                            {currentUser &&
                                                bookingData.phone ===
                                                    currentUser.phone && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        ✓ Tự động điền từ tài
                                                        khoản
                                                    </p>
                                                )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={bookingData.email}
                                                onChange={handleChange}
                                                placeholder="example@email.com"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                            />
                                            {currentUser &&
                                                bookingData.email ===
                                                    currentUser.email && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        ✓ Tự động điền từ tài
                                                        khoản
                                                    </p>
                                                )}
                                        </div>

                                        {/* Yêu cầu đặc biệt */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Yêu cầu đặc biệt (tùy chọn)
                                            </label>
                                            <textarea
                                                name="requests"
                                                value={bookingData.requests}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="Ví dụ: Cần giường phụ, phòng không hút thuốc, dịp kỷ niệm..."
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors resize-none"
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex space-x-4 mt-8">
                                        <button
                                            onClick={prevStep}
                                            className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                                        >
                                            Quay Lại
                                        </button>
                                        <button
                                            onClick={nextStep}
                                            className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                                        >
                                            Tiếp Tục - Thanh Toán
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {step === 3 && (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                        Thanh Toán
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Lựa chọn phương thức thanh toán phù hợp
                                    </p>

                                    <div className="grid lg:grid-cols-3 gap-8">
                                        {/* Payment Options */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Hình thức thanh toán */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                                                    Hình thức thanh toán
                                                </h4>
                                                <div className="space-y-4">
                                                    {/* Thanh toán toàn bộ */}
                                                    <label
                                                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                            bookingData.paymentOption ===
                                                            "full"
                                                                ? "border-rose-500 bg-rose-50 shadow-sm"
                                                                : "border-gray-300 hover:border-gray-400"
                                                        }`}
                                                    >
                                                        <div className="flex items-start">
                                                            <input
                                                                type="radio"
                                                                name="paymentOption"
                                                                value="full"
                                                                checked={
                                                                    bookingData.paymentOption ===
                                                                    "full"
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                className="mt-1 mr-3 text-rose-600 focus:ring-rose-500"
                                                            />
                                                            <div>
                                                                <span className="font-bold text-rose-700">
                                                                    Thanh toán
                                                                    toàn bộ
                                                                </span>
                                                                <p className="text-gray-600 mt-1 text-sm">
                                                                    Thanh toán
                                                                    100% tổng số
                                                                    tiền
                                                                </p>
                                                                <p className="text-rose-600 font-semibold mt-2">
                                                                    {totalPrice.toLocaleString()}
                                                                    ₫
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>

                                                    {/* Đặt cọc */}
                                                    <label
                                                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                            bookingData.paymentOption ===
                                                            "deposit"
                                                                ? "border-rose-500 bg-rose-50 shadow-sm"
                                                                : "border-gray-300 hover:border-gray-400"
                                                        }`}
                                                    >
                                                        <div className="flex items-start">
                                                            <input
                                                                type="radio"
                                                                name="paymentOption"
                                                                value="deposit"
                                                                checked={
                                                                    bookingData.paymentOption ===
                                                                    "deposit"
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                className="mt-1 mr-3 text-rose-600 focus:ring-rose-500"
                                                            />
                                                            <div>
                                                                <span className="font-bold text-rose-700">
                                                                    Đặt cọc{" "}
                                                                    {DEPOSIT_PERCENTAGE *
                                                                        100}
                                                                    %
                                                                </span>
                                                                <p className="text-gray-600 mt-1 text-sm">
                                                                    Thanh toán{" "}
                                                                    {DEPOSIT_PERCENTAGE *
                                                                        100}
                                                                    % trước, số
                                                                    tiền còn lại
                                                                    thanh toán
                                                                    khi nhận
                                                                    phòng
                                                                </p>
                                                                <div className="mt-2">
                                                                    <p className="text-rose-600 font-semibold">
                                                                        Đặt cọc:{" "}
                                                                        {depositAmount.toLocaleString()}
                                                                        ₫
                                                                    </p>
                                                                    <p className="text-gray-500 text-xs">
                                                                        Còn lại:{" "}
                                                                        {remainingAmount.toLocaleString()}
                                                                        ₫ (thanh
                                                                        toán khi
                                                                        check-in)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Phương thức thanh toán */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                                                    Phương thức thanh toán
                                                </h4>
                                                <select
                                                    name="paymentMethod"
                                                    value={
                                                        bookingData.paymentMethod
                                                    }
                                                    onChange={handleChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                                                >
                                                    <option value="vnpay">
                                                        VNPay - Ví điện tử & Thẻ
                                                        ngân hàng
                                                    </option>
                                                    <option value="cash">
                                                        Thanh toán trực tiếp tại
                                                        khách sạn
                                                    </option>
                                                </select>

                                                {/* Thông báo cho thanh toán tại quầy */}
                                                {bookingData.paymentMethod ===
                                                    "cash" && (
                                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm text-blue-700">
                                                            💡{" "}
                                                            <strong>
                                                                Lưu ý:
                                                            </strong>{" "}
                                                            Khi chọn thanh toán
                                                            tại quầy, quý khách
                                                            vui lòng đến trực
                                                            tiếp khách sạn để
                                                            hoàn tất thủ tục
                                                            thanh toán và nhận
                                                            phòng.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit sticky top-4">
                                            <h4 className="font-bold text-gray-800 mb-4 text-lg border-b pb-2">
                                                Tóm Tắt Đơn Hàng
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Khách hàng:
                                                    </span>
                                                    <span className="font-semibold">
                                                        {bookingData.name ||
                                                            "Chưa nhập"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Loại phòng:
                                                    </span>
                                                    <span className="font-semibold text-right">
                                                        {getRoomTypeName()}
                                                        <br />
                                                        <span className="text-gray-500 text-xs">
                                                            {
                                                                bookingData.quantity
                                                            }{" "}
                                                            phòng
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Thời gian:
                                                    </span>
                                                    <span className="font-semibold text-right">
                                                        {bookingData.checkin}
                                                        <br />
                                                        đến{" "}
                                                        {bookingData.checkout}
                                                        <br />
                                                        <span className="text-gray-500 text-xs">
                                                            {Math.ceil(
                                                                (new Date(
                                                                    bookingData.checkout,
                                                                ) -
                                                                    new Date(
                                                                        bookingData.checkin,
                                                                    )) /
                                                                    (1000 *
                                                                        60 *
                                                                        60 *
                                                                        24),
                                                            )}{" "}
                                                            đêm
                                                        </span>
                                                    </span>
                                                </div>

                                                <hr className="my-3 border-gray-300" />

                                                <div className="flex justify-between text-base">
                                                    <span className="font-semibold">
                                                        Tổng chi phí:
                                                    </span>
                                                    <span className="font-bold text-rose-600">
                                                        {totalPrice.toLocaleString()}
                                                        ₫
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Hình thức:
                                                    </span>
                                                    <span className="text-rose-600 font-medium">
                                                        {bookingData.paymentOption ===
                                                        "full"
                                                            ? "Thanh toán toàn bộ"
                                                            : `Đặt cọc ${
                                                                  DEPOSIT_PERCENTAGE *
                                                                  100
                                                              }%`}
                                                    </span>
                                                </div>

                                                <hr className="my-3 border-gray-300" />

                                                <div
                                                    className={`p-3 rounded-lg border ${
                                                        bookingData.paymentMethod ===
                                                        "cash"
                                                            ? "bg-blue-50 border-blue-200"
                                                            : "bg-amber-50 border-amber-200"
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center font-bold">
                                                        <span className="text-gray-800">
                                                            {bookingData.paymentMethod ===
                                                            "cash"
                                                                ? "Số tiền cần thanh toán tại quầy:"
                                                                : "Cần thanh toán:"}
                                                        </span>
                                                        <span
                                                            className={`text-2xl ${
                                                                bookingData.paymentMethod ===
                                                                "cash"
                                                                    ? "text-blue-600"
                                                                    : "text-amber-600"
                                                            }`}
                                                        >
                                                            {amountToPay.toLocaleString()}
                                                            ₫
                                                        </span>
                                                    </div>
                                                    {bookingData.paymentOption ===
                                                        "deposit" && (
                                                        <p className="text-xs text-gray-600 mt-2">
                                                            Số tiền còn lại{" "}
                                                            {remainingAmount.toLocaleString()}
                                                            ₫ sẽ được thanh toán
                                                            khi nhận phòng
                                                        </p>
                                                    )}
                                                    {bookingData.paymentMethod ===
                                                        "cash" && (
                                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                                            💳 Thanh toán trực
                                                            tiếp tại quầy lễ tân
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={prevStep}
                                            className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                                        >
                                            Quay Lại
                                        </button>
                                        <button
                                            onClick={handleBookingSubmit}
                                            disabled={
                                                isSubmitting || !currentUser
                                            }
                                            className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Đang xử lý...
                                                </div>
                                            ) : !currentUser ? (
                                                "Vui lòng đăng nhập"
                                            ) : bookingData.paymentMethod ===
                                              "cash" ? (
                                                `Xác Nhận Đặt Phòng`
                                            ) : (
                                                `Thanh Toán ${amountToPay.toLocaleString()}₫`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
