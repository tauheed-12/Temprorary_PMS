import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Billing from './pages/Billing'
import Inventory from './pages/Inventory'
import Warehouse from './pages/Warehouse'
import Suppliers from './pages/Suppliers'
import History from './pages/History'
import Staff from './pages/Staff'
import Layout from './components/Layout'

const PrivateRoute = ({ children, ownerOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (ownerOnly && user.privilege_level < 2) return <Navigate to="/billing" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<PrivateRoute ownerOnly><Dashboard /></PrivateRoute>} />
        <Route path="billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
        <Route path="inventory" element={<PrivateRoute ownerOnly><Inventory /></PrivateRoute>} />
        <Route path="warehouse" element={<PrivateRoute ownerOnly><Warehouse /></PrivateRoute>} />
        <Route path="suppliers" element={<PrivateRoute ownerOnly><Suppliers /></PrivateRoute>} />
        <Route path="history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="staff" element={<PrivateRoute ownerOnly><Staff /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}