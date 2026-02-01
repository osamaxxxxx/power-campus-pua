import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Courses from './pages/Courses'
import MyCourses from './pages/MyCourses'
import Users from './pages/Users'
import Attendance from './pages/Attendance'
import Grades from './pages/Grades'
import Schedule from './pages/Schedule'
import './App.css'

const Home = () => {
    const { user } = useAuth()
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Welcome to Power Campus</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.2rem' }}>
                    Hello, <strong style={{ color: 'var(--primary)' }}>{user?.name}</strong>! You are currently logged in as {user?.role === 'Admin' ? 'an' : 'a'} <strong>{user?.role}</strong>.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--surface)' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Your Dashboard</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>View your personalized academic overview and statistics.</p>
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--surface)' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Next Class</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No classes scheduled for the next 24 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* Public registration removed as per University requirements */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Courses />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-courses"
                        element={
                            <ProtectedRoute roles={['Student']}>
                                <Layout>
                                    <MyCourses />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <Layout>
                                    <Users />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance"
                        element={
                            <ProtectedRoute roles={['Admin', 'Instructor', 'Student']}>
                                <Layout>
                                    <Attendance />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/grades"
                        element={
                            <ProtectedRoute roles={['Admin', 'Instructor', 'Student']}>
                                <Layout>
                                    <Grades />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/schedule"
                        element={
                            <ProtectedRoute roles={['Admin', 'Instructor', 'Student']}>
                                <Layout>
                                    <Schedule />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
