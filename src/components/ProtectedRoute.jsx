import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const userRole = localStorage.getItem('role');
    
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;