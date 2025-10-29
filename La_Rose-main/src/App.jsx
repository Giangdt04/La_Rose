import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import RoomManagement from "./admin/pages/RoomManagement";
import BookingManagement from "./admin/pages/BookingManagement";
import CustomerManagement from "./admin/pages/CustomerManagement";
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import HistoryBookingPage from "./pages/HistoryBookingPage";
function App() {
    return (
        <Routes>
            {/* Client Routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="login" element={<LoginPage state={"login"} />} />
                <Route
                    path="register"
                    element={<LoginPage state={"register"} />}
                />

                <Route path="about" element={<AboutPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="bookings" element={< HistoryBookingPage/>} />
                <Route
                    path="/api/auth/verify"
                    element={<EmailVerificationPage />}
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
