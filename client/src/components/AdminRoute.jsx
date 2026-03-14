import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role level map mirrors the server-side ROLE_LEVELS
const ROLE_LEVELS = {
    user: 10,
    member: 15,
    saathi: 20,
    agent: 30,
    supportTeam: 40,
    subAdmin: 70,
    superAdmin: 100,
    admin: 100
};

/**
 * AdminRoute - guards a route tree by role.
 *
 * Usage A (layout wrapper — no children prop):
 *   <Route element={<AdminRoute minRole="supportTeam" />}>
 *     <Route path="users" element={<UserManagement />} />
 *   </Route>
 *
 * Usage B (with explicit children — for wrapping a layout component that has its own Outlet):
 *   <Route element={<AdminRoute minRole="supportTeam"><AdminLayout /></AdminRoute>}>
 */
const AdminRoute = ({ children, minRole = 'supportTeam' }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const userLevel = ROLE_LEVELS[user?.role] || 0;
    const minLevel = ROLE_LEVELS[minRole] || 0;

    if (!user || userLevel < minLevel) {
        return <Navigate to="/dashboard" replace />;
    }

    // If children provided (e.g. <AdminLayout />), render them — they must render <Outlet /> themselves.
    // Otherwise render <Outlet /> directly for simple guard usage.
    return children ?? <Outlet />;
};

export default AdminRoute;
