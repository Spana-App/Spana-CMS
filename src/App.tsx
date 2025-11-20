import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import OverviewPage from './pages/overview'
import LoginPage from './authPages/login'
import UserManagement from './pages/usermanagement'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE */}
        <Route path="/" element={<LoginPage />} />

        {/* DASHBOARD LAYOUT */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<OverviewPage />} /> 
          <Route path="overview" element={<OverviewPage />} />
          <Route path="usermanagement" element={<UserManagement />} />
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
