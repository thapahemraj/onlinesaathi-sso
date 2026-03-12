import { Navigate } from 'react-router-dom';
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

const AdminRoute = ({ children, minRole = 'supportTeam' }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    const userLevel = ROLE_LEVELS[user?.role] || 0;
    const minLevel = ROLE_LEVELS[minRole] || 0;

    if (!user || userLevel < minLevel) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default AdminRoute;
