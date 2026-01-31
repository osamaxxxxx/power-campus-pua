import { createContext, useState, useContext, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in on load
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        if (storedUser && token) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email)
            const response = await API.post('/api/auth/login', { email, password })
            console.log('Login response:', response.data)

            const { token, role, name, id } = response.data

            const userData = { id, name, role }
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
            return { success: true, role }
        } catch (error) {
            console.error('Login error full details:', error)
            let message = 'Login failed. Please check your credentials.'

            if (error.response) {
                // The server responded with a status code that falls out of the range of 2xx
                console.error('Error response data:', error.response.data)
                message = error.response.data.message ||
                    (typeof error.response.data === 'string' ? error.response.data : message)
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request)
                message = 'No response from server. Check if the backend is running and CORS is enabled.'
            } else {
                // Something happened in setting up the request that triggered an Error
                message = error.message
            }

            return { success: false, message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const register = async (userData) => {
        try {
            await API.post('/api/auth/register', userData)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data || 'Registration failed'
            }
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
