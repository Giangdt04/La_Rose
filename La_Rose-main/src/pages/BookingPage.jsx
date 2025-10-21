import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useMemo } from 'react';

const DEPOSIT_PERCENTAGE = 0.5; // Đặt cọc 20%

// Hàm kiểm tra định dạng email cơ bản
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Hàm kiểm tra định dạng số điện thoại (chỉ kiểm tra là số và độ dài tối thiểu)
const isValidPhone = (phone) => {
    return /^\d{9,15}$/.test(phone);
};

// Component hiển thị nội dung trang xác nhận (trước đây là ConfirmationPage)
// Giờ nhận bookingInfo và hàm resetBooking từ component cha
const ConfirmationContent = ({ bookingInfo, resetBooking }) => {
    return (
        <div className="container mx-auto px-6 py-12 font-inter text-center min-h-full bg-white">
            <div className="max-w-xl mx-auto p-10 transform transition-all">
                <svg
                    className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce"
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
                <h3 className="text-3xl font-extrabold text-green-700 mb-3">
                    Chúc mừng! Đặt phòng thành công!
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                    Đơn đặt phòng của quý khách đã được ghi nhận và thanh toán
                    thành công. La Rosé rất mong được đón tiếp quý khách.
                </p>
                {bookingInfo && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-sm text-left mb-6">
                        <p className="font-semibold text-green-800">
                            Phòng đã đặt: {bookingInfo.roomType} (Phòng{" "}
                            {bookingInfo.roomNumber})
                        </p>
                        <p>
                            Số tiền đã thanh toán: **
                            {bookingInfo.amountPaid.toLocaleString()}₫**
                        </p>
                    </div>
                )}
                <p className="text-sm text-gray-500 mb-8">
                    Vui lòng kiểm tra email để xem chi tiết xác nhận (bao gồm
                    thông tin phòng và số tiền còn lại nếu có).
                </p>
                <button
                    onClick={resetBooking}
                    className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors shadow-lg transform hover:scale-[1.02]"
                >
                    Tạo đơn đặt phòng mới
                </button>
            </div>
        </div>
    );
};

const BookingPage = () => {
    const { addBooking, rooms } = useData();

    // State quản lý luồng ứng dụng
    const [step, setStep] = useState(1);
    const [confirmedBookingInfo, setConfirmedBookingInfo] = useState(null); // Sử dụng state này thay cho router
    const [errorMessage, setErrorMessage] = useState("");

    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const todayDefault = todayDate.toISOString().split("T")[0];
    const tomorrowDefault = tomorrowDate.toISOString().split("T")[0];

    const initialBookingData = {
        roomType: "deluxe",
        quantity: 1,
        checkin: todayDefault,
        checkout: tomorrowDefault,
        name: "",
        phone: "",
        email: "",
        requests: "",
        paymentMethod: "vnpay",
        paymentOption: "full",
    };

    const [bookingData, setBookingData] = useState(initialBookingData);
    const [totalPrice, setTotalPrice] = useState(0);

    const prices = { deluxe: 2500000, suite: 4500000, honeymoon: 3800000 };
    const roomTypeNames = {
        deluxe: "Phòng Deluxe",
        suite: "Phòng Suite",
        honeymoon: "Phòng Honeymoon",
    };

    // Tính toán tổng tiền
    useEffect(() => {
        const { roomType, quantity, checkin, checkout } = bookingData;
        let nights = 1;
        if (checkin && checkout) {
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const diffTime = Math.abs(checkoutDate - checkinDate);
            nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
        setTotalPrice(prices[roomType] * quantity * nights);
    }, [
        bookingData.roomType,
        bookingData.quantity,
        bookingData.checkin,
        bookingData.checkout,
        prices,
    ]);

    // Tính toán các khoản thanh toán
    const { depositAmount, remainingAmount, amountToPay } = useMemo(() => {
        const calculatedDepositAmount =
            Math.round((totalPrice * DEPOSIT_PERCENTAGE) / 1000) * 1000;
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingData((prev) => ({ ...prev, [name]: value }));
        setErrorMessage("");
    };

    // Hàm chuyển bước
    const nextStep = () => {
        setErrorMessage("");

        if (step === 1) {
            if (
                !bookingData.checkin ||
                !bookingData.checkout ||
                new Date(bookingData.checkin) >= new Date(bookingData.checkout)
            ) {
                setErrorMessage(
                    "Vui lòng chọn ngày nhận và trả phòng hợp lệ (Ngày trả phải sau ngày nhận).",
                );
                return;
            }
        }

        if (step === 2) {
            if (!bookingData.name || !bookingData.phone || !bookingData.email) {
                setErrorMessage(
                    "Vui lòng điền đầy đủ Họ và tên, Số điện thoại và Email.",
                );
                return;
            }
            if (!isValidPhone(bookingData.phone)) {
                setErrorMessage(
                    "Số điện thoại không hợp lệ (Vui lòng nhập 9-15 chữ số).",
                );
                return;
            }
            if (!isValidEmail(bookingData.email)) {
                setErrorMessage("Email không hợp lệ. Vui lòng kiểm tra lại.");
                return;
            }
        }

        setStep((s) => s + 1);
    };

    const prevStep = () => {
        setErrorMessage("");
        setStep((s) => s - 1);
    };

    const resetBooking = () => {
        setConfirmedBookingInfo(null);
        setBookingData(initialBookingData); // Reset form data
        setStep(1);
        setTotalPrice(0);
    };

    const handleBookingSubmit = () => {
        setErrorMessage("");

        if (!bookingData.paymentMethod) {
            setErrorMessage(
                "Vui lòng chọn cổng thanh toán trước khi hoàn tất.",
            );
            return;
        }

        const availableRoom = rooms?.find(
            (r) => r.type === bookingData.roomType && r.status === "available",
        );

        if (!availableRoom) {
            setErrorMessage(
                "Loại phòng này tạm thời không còn phòng trống cho ngày bạn chọn. Vui lòng chọn loại phòng khác.",
            );
            return;
        }

        const paymentStatus =
            bookingData.paymentOption === "full" ? "confirmed" : "deposit_paid";

        const newBookingPayload = {
            customer: bookingData.name,
            roomType: bookingData.roomType,
            roomNumber: availableRoom.number,
            dates: `${bookingData.checkin} - ${bookingData.checkout}`,
            total: totalPrice,
            amountPaid: amountToPay,
            remainingDue: remainingAmount,
            paymentMethod: bookingData.paymentMethod,
            status: paymentStatus,
        };

        addBooking(newBookingPayload);

        console.log(
            `Đặt phòng thành công! Số tiền thanh toán ban đầu là ${amountToPay.toLocaleString()}₫.`,
        );

        // Kích hoạt màn hình xác nhận bằng cách cập nhật state
        setConfirmedBookingInfo(newBookingPayload);
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="container mx-auto px-6 py-16 font-inter">
            <h2 className="text-4xl font-bold text-center text-pink-700 mb-12">
                Đặt Phòng
            </h2>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-pink-100 p-8">
                {/* Conditional Rendering: Hiển thị Xác nhận hoặc Form theo state */}
                {confirmedBookingInfo ? (
                    <ConfirmationContent
                        bookingInfo={confirmedBookingInfo}
                        resetBooking={resetBooking}
                    />
                ) : (
                    // Form Đặt phòng (Các Bước 1, 2, 3)
                    <>
                        {/* Hiển thị thông báo lỗi */}
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium">
                                {errorMessage}
                            </div>
                        )}

                        {/* Step 1: Room & Dates */}
                        {step === 1 && (
                            <div>
                                <h3 className="text-2xl font-semibold text-pink-700 mb-6">
                                    Bước 1: Chọn phòng và thời gian
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Loại phòng
                                        </label>
                                        <select
                                            name="roomType"
                                            value={bookingData.roomType}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        >
                                            <option value="deluxe">
                                                Phòng Deluxe -{" "}
                                                {prices.deluxe.toLocaleString()}
                                                ₫ / đêm
                                            </option>
                                            <option value="suite">
                                                Phòng Suite -{" "}
                                                {prices.suite.toLocaleString()}₫
                                                / đêm
                                            </option>
                                            <option value="honeymoon">
                                                Phòng Honeymoon -{" "}
                                                {prices.honeymoon.toLocaleString()}
                                                ₫ / đêm
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số lượng phòng
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={bookingData.quantity}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày nhận phòng
                                        </label>
                                        <input
                                            type="date"
                                            name="checkin"
                                            value={bookingData.checkin}
                                            onChange={handleChange}
                                            min={today}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày trả phòng
                                        </label>
                                        <input
                                            type="date"
                                            name="checkout"
                                            value={bookingData.checkout}
                                            onChange={handleChange}
                                            min={bookingData.checkin || today}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-pink-50 rounded-lg flex justify-between items-center border border-pink-200">
                                    <span className="font-semibold text-pink-700 text-lg">
                                        Tổng chi phí dự kiến:
                                    </span>
                                    <span className="text-3xl font-bold text-amber-600">
                                        {totalPrice.toLocaleString()}₫
                                    </span>
                                </div>
                                <button
                                    onClick={nextStep}
                                    className="w-full mt-6 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg"
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        )}

                        {/* Step 2: Customer Information */}
                        {step === 2 && (
                            <div>
                                <h3 className="text-2xl font-semibold text-pink-700 mb-6">
                                    Bước 2: Thông tin khách hàng
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={bookingData.name}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={bookingData.phone}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={bookingData.email}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Yêu cầu đặc biệt
                                        </label>
                                        <textarea
                                            name="requests"
                                            value={bookingData.requests}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Ví dụ: Cần phòng tầng cao, giường phụ..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={prevStep}
                                        className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="flex-1 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Tiếp tục
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div>
                                <h3 className="text-2xl font-semibold text-pink-700 mb-8">
                                    Bước 3: Thanh toán
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        {/* 6. Lựa chọn hình thức thanh toán: Toàn bộ hoặc Đặt cọc */}
                                        <h4 className="font-semibold text-gray-800 mb-4 text-xl">
                                            1. Chọn hình thức thanh toán
                                        </h4>
                                        <div className="space-y-4">
                                            {/* Full Payment Option */}
                                            <label
                                                className={`block p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${
                                                    bookingData.paymentOption ===
                                                    "full"
                                                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-500"
                                                        : "border-gray-300 hover:border-gray-400"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentOption"
                                                    value="full"
                                                    checked={
                                                        bookingData.paymentOption ===
                                                        "full"
                                                    }
                                                    onChange={handleChange}
                                                    className="mr-3 text-pink-600 focus:ring-pink-500"
                                                />
                                                <span className="font-bold text-lg text-pink-700">
                                                    Thanh toán toàn bộ
                                                </span>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Tổng tiền:{" "}
                                                    <span className="font-bold text-pink-600">
                                                        {totalPrice.toLocaleString()}
                                                        ₫
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500 italic">
                                                    Đặt phòng được xác nhận và
                                                    thanh toán xong 100%.
                                                </p>
                                            </label>

                                            {/* Partial Deposit Option */}
                                            <label
                                                className={`block p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${
                                                    bookingData.paymentOption ===
                                                    "deposit"
                                                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-500"
                                                        : "border-gray-300 hover:border-gray-400"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentOption"
                                                    value="deposit"
                                                    checked={
                                                        bookingData.paymentOption ===
                                                        "deposit"
                                                    }
                                                    onChange={handleChange}
                                                    className="mr-3 text-pink-600 focus:ring-pink-500"
                                                />
                                                <span className="font-bold text-lg text-pink-700">
                                                    Đặt cọc {DEPOSIT_PERCENTAGE * 100}
                                                    %
                                                </span>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Thanh toán cọc:{" "}
                                                    <span className="font-bold text-pink-600">
                                                        {depositAmount.toLocaleString()}
                                                        ₫
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500 italic">
                                                    Số tiền còn lại{" "}
                                                    {remainingAmount.toLocaleString()}
                                                    ₫ sẽ được thanh toán khi
                                                    nhận phòng (Check-in).
                                                </p>
                                            </label>
                                        </div>

                                        {/* 7. Cổng thanh toán */}
                                        <h4 className="font-semibold text-gray-800 mt-8 mb-4 text-xl">
                                            2. Chọn cổng thanh toán
                                        </h4>
                                        <select
                                            name="paymentMethod"
                                            value={bookingData.paymentMethod}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                        >
                                            <option value="vnpay">VNPay</option>
                                            <option value="momo">MoMo</option>
                                            <option value="bank">
                                                Chuyển khoản Ngân hàng
                                            </option>
                                        </select>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-pink-50 p-6 rounded-xl border border-pink-200 shadow-md h-fit">
                                        <h4 className="font-bold text-pink-700 mb-4 text-xl">
                                            Tóm tắt đơn hàng
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <p>
                                                <strong>Khách hàng:</strong>{" "}
                                                {bookingData.name}
                                            </p>
                                            <p>
                                                <strong>Loại phòng:</strong>{" "}
                                                {
                                                    roomTypeNames[
                                                        bookingData.roomType
                                                    ]
                                                }{" "}
                                                ({bookingData.quantity} phòng)
                                            </p>
                                            <p>
                                                <strong>Ngày:</strong>{" "}
                                                {bookingData.checkin} đến{" "}
                                                {bookingData.checkout}
                                            </p>
                                            <hr className="my-3 border-pink-300" />
                                            <p className="flex justify-between items-center text-lg">
                                                <span className="font-semibold">
                                                    Tổng chi phí:
                                                </span>
                                                <span className="font-bold text-pink-700">
                                                    {totalPrice.toLocaleString()}
                                                    ₫
                                                </span>
                                            </p>
                                            <p className="flex justify-between items-center text-lg">
                                                <span className="font-semibold">
                                                    Hình thức:
                                                </span>
                                                <span className="text-pink-600 font-medium">
                                                    {bookingData.paymentOption ===
                                                    "full"
                                                        ? "Thanh toán toàn bộ"
                                                        : "Đặt cọc 20%"}
                                                </span>
                                            </p>

                                            <hr className="my-3 border-pink-300" />

                                            <p className="flex justify-between items-center font-bold text-xl">
                                                <span>
                                                    Cần thanh toán ngay:
                                                </span>
                                                <span className="text-3xl font-extrabold text-amber-600">
                                                    {amountToPay.toLocaleString()}
                                                    ₫
                                                </span>
                                            </p>

                                            {bookingData.paymentOption ===
                                                "deposit" && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    (Số tiền còn lại{" "}
                                                    {remainingAmount.toLocaleString()}
                                                    ₫ sẽ được thanh toán khi
                                                    nhận phòng.)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex space-x-4 mt-8">
                                    <button
                                        onClick={prevStep}
                                        className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleBookingSubmit}
                                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white p-3 rounded-lg hover:shadow-lg transition-all font-semibold text-lg"
                                    >
                                        Thanh toán & Hoàn tất (
                                        {amountToPay.toLocaleString()}₫)
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
