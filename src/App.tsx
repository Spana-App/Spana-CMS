import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import OverviewPage from './pages/overview'
import LoginPage from './authPages/login'
import OTPPage from './authPages/otp'
import UserManagement from './pages/usermanagement'
import ServiceManagement from './pages/servicemanagement'
import BookingManagement from './pages/bookingmanagement'
import DocumentManagement from './pages/documentmanagement'
import ContentManagement from './pages/contentmanagement'
import NotificationManagement from './pages/notificationmanagement'
import AdminProfile from './pages/adminprofile'
import ReviewsDisputes from './pages/reviewsdisputes'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH PAGES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/otp" element={<OTPPage />} />

        {/* DASHBOARD LAYOUT */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<OverviewPage />} /> 
          <Route path="overview" element={<OverviewPage />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="reviews" element={<ReviewsDisputes />} />
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
