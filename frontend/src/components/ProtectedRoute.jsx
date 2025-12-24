import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        // Redirect non-admins to a safe page or unauthorized error page
        return <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">Unauthorized: Admin Access Required</div>;
    }

    return children;
};

export default ProtectedRoute;
