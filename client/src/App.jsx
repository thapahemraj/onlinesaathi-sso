import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ConsentPage from './pages/ConsentPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Applications from './pages/admin/Applications';
import ApplicationDetail from './pages/admin/ApplicationDetail';
import Organizations from './pages/admin/Organizations';
import AdminLedger from './pages/admin/AdminLedger';
import AddMoneyRequest from './pages/admin/AddMoneyRequest';
import IMEAgentOnboarding from './pages/admin/service-management/IMEAgentOnboarding';
import IMEKYCCustomer from './pages/admin/service-management/IMEKYCCustomer';
import PrabhuAgentOnboarding from './pages/admin/service-management/PrabhuAgentOnboarding';
import PrabhuCustomerList from './pages/admin/service-management/PrabhuCustomerList';
import RemitterList from './pages/admin/service-management/RemitterList';
import SecuritySettings from './pages/admin/SecuritySettings';
import AuditLogs from './pages/admin/AuditLogs';
import WalletBalance from './pages/admin/WalletBalance';
import WalletHistory from './pages/admin/WalletHistory';
import PartnerTransactionLogs from './pages/admin/PartnerTransactionLogs';
import RoleManagement from './pages/admin/RoleManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import AdminRoute from './components/AdminRoute';
import RoleRoute from './components/RoleRoute';
import AgentDashboard from './pages/agent/AgentDashboard';
import KYCReview from './pages/agent/KYCReview';
import SaathiDashboard from './pages/saathi/SaathiDashboard';
import SupportDashboard from './pages/support/SupportDashboard';
import UsersList from './pages/dashboard/UsersList';
import AddUser from './pages/dashboard/AddUser';
import MemberList from './pages/dashboard/MemberList';
import SaathiList from './pages/dashboard/SaathiList';
import DistrictPartnerList from './pages/dashboard/DistrictPartnerList';
import AddDistrictPartner from './pages/dashboard/AddDistrictPartner';
import AddStatePartner from './pages/dashboard/AddStatePartner';
import StatePartnerList from './pages/dashboard/StatePartnerList';
import ParentMappingRequests from './pages/dashboard/ParentMappingRequests';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* OAuth Consent Screen */}
        <Route path="/oauth/consent" element={<ProtectedRoute><ConsentPage /></ProtectedRoute>} />

        {/* ── ADMIN PANEL ──────────────────────────────────────────────
            MUST be defined BEFORE /dashboard/* wildcard.
            Two-level guard: outer AdminRoute checks auth, inner
            AdminLayout renders the sidebar + <Outlet /> for page content.
        ──────────────────────────────────────────────────────────────── */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminRoute minRole="supportTeam">
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="members" element={<MemberList />} />
          <Route path="saathi" element={<SaathiList />} />
          <Route path="district-partner" element={<DistrictPartnerList />} />
          <Route path="district-partner/add" element={<AddDistrictPartner />} />
          <Route path="state-partner" element={<StatePartnerList />} />
          <Route path="state-partner/add" element={<AddStatePartner />} />
          <Route path="parent-mapping-requests" element={<ParentMappingRequests />} />
          <Route path="roles" element={
            <AdminRoute minRole="subAdmin"><RoleManagement /></AdminRoute>
          } />
          <Route path="apps" element={<Applications />} />
          <Route path="apps/:id" element={<ApplicationDetail />} />
          <Route path="orgs" element={<Organizations />} />
          <Route path="account/admin-ledger" element={<AdminLedger />} />
          <Route path="account/add-money-request" element={<AddMoneyRequest />} />
          <Route path="service-management/ime-agent-onboarding" element={<IMEAgentOnboarding />} />
          <Route path="service-management/ime-kyc-customer" element={<IMEKYCCustomer />} />
          <Route path="service-management/prabhu-agent-onboarding" element={<PrabhuAgentOnboarding />} />
          <Route path="service-management/prabhu-customer-list" element={<PrabhuCustomerList />} />
          <Route path="service-management/remitter-list" element={<RemitterList />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="wallet-balance" element={<WalletBalance />} />
          <Route path="wallet-history" element={<WalletHistory />} />
          <Route path="partner-transactions" element={<PartnerTransactionLogs />} />
        </Route>

        {/* ── USER DASHBOARD — wildcard kept AFTER /dashboard/admin ── */}
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Agent KYC */}
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
      </Routes>
    </div>
  );
}

export default App;
