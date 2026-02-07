import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import Landing from './Landing'
import UserDashboard from './dashboard/UserDashboard'
import AdminDashboard from './dashboard/AdminDashboard'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import './dashboard/DashboardLayout.css'

// Main Layout with Sidebar
const DashboardLayout = () => (
  <div className="app-container">
    <div className="decorative-circles">
      <div className="circle-top"></div>
      <div className="circle-bottom"></div>
    </div>
    <div className="content-wrapper">
      <div className="translucent-container">
        <div className="flex min-h-full">
          <Sidebar />
          <main className="main-content">
            <div className="fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
