import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
 * RoleRoute — only renders children if user has the given role(s) or meets minRole level.
 *
 * Props:
 *   roles        — array of exact role strings allowed (OR logic), e.g. ['agent','subAdmin','superAdmin']
 *   minRole      — minimum role level required (inclusive)
 *   redirectTo   — where to redirect if access denied (default: '/dashboard')
 */
const RoleRoute = ({ children, roles, minRole, redirectTo = '/dashboard' }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    const userLevel = ROLE_LEVELS[user.role] || 0;

    if (minRole) {
        const minLevel = ROLE_LEVELS[minRole] || 0;
        if (userLevel < minLevel) return <Navigate to={redirectTo} />;
    } else if (roles && roles.length > 0) {
        if (!roles.includes(user.role)) return <Navigate to={redirectTo} />;
    }

    return children;
};

export default RoleRoute;
