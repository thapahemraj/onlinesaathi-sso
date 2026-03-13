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
import AuditLogs from './pages/admin/AuditLogs';
import RoleManagement from './pages/admin/RoleManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import AdminRoute from './components/AdminRoute';
import RoleRoute from './components/RoleRoute';
import AgentDashboard from './pages/agent/AgentDashboard';
import KYCReview from './pages/agent/KYCReview';
import SaathiDashboard from './pages/saathi/SaathiDashboard';
import SupportDashboard from './pages/support/SupportDashboard';
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

        {/* Agent KYC Dashboard */}
        <Route path="/agent" element={
          <RoleRoute roles={['agent', 'subAdmin', 'superAdmin', 'admin']}>
            <AgentDashboard />
          </RoleRoute>
        } />
        <Route path="/agent/kyc/:id" element={
          <RoleRoute roles={['agent', 'subAdmin', 'superAdmin', 'admin']}>
            <KYCReview />
          </RoleRoute>
        } />

        {/* Saathi Centre */}
        <Route path="/saathi" element={
          <RoleRoute roles={['saathi', 'subAdmin', 'superAdmin', 'admin']}>
            <SaathiDashboard />
          </RoleRoute>
        } />

        {/* Support Centre */}
        <Route path="/support" element={
          <RoleRoute minRole="supportTeam">
            <SupportDashboard />
          </RoleRoute>
        } />

        {/* Admin Dashboard */}
        <Route path="/dashboard/admin" element={
          <AdminRoute minRole="supportTeam">
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={
            <AdminRoute minRole="subAdmin"><RoleManagement /></AdminRoute>
          } />
          <Route path="apps" element={<Applications />} />
          <Route path="apps/:id" element={<ApplicationDetail />} />
          <Route path="orgs" element={<Organizations />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="transactions" element={<TransactionManagement />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
