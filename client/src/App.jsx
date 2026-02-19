import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ConsentPage from './pages/ConsentPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Applications from './pages/admin/Applications';
import ApplicationDetail from './pages/admin/ApplicationDetail';
import Organizations from './pages/admin/Organizations';
import SecuritySettings from './pages/admin/SecuritySettings';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* OAuth Consent Screen */}
        <Route path="/oauth/consent" element={<ProtectedRoute><ConsentPage /></ProtectedRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Admin Dashboard */}
        <Route path="/dashboard/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="apps" element={<Applications />} />
          <Route path="apps/:id" element={<ApplicationDetail />} />
          <Route path="orgs" element={<Organizations />} />
          <Route path="security" element={<SecuritySettings />} />
          {/* Add more admin routes here as needed */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
