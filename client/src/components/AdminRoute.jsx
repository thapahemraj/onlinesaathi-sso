import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Ideally a nicer spinner

    // Check if user is logged in AND is admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default AdminRoute;
