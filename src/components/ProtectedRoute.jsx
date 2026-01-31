import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth()
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    // Redirect Admin from home to users page
    if (user.role === 'Admin' && location.pathname === '/') {
        return <Navigate to="/users" replace />
    }

    return children
}

export default ProtectedRoute
