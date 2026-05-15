import React, { useState, useEffect } from 'react'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
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

import enrollmentService from './api/enrollmentService'
import { Users as UsersIcon, CheckCircle, XCircle, Activity, TrendingUp } from 'lucide-react'
import './App.css'

const Home = () => {
    const { user } = useAuth()
    const [activeSession, setActiveSession] = useState(null)
    const [markedStudents, setMarkedStudents] = useState([])
    const [enrolledStudents, setEnrolledStudents] = useState([])
    const [connectionStatus, setConnectionStatus] = useState('Connecting...')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        const hubUrl = `${normalizedBaseUrl}/attendanceHub`
        
        const connection = new HubConnectionBuilder()
            .withUrl(hubUrl, { accessTokenFactory: () => token })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build()

        connection.onreconnecting(() => setConnectionStatus('Reconnecting...'))
        connection.onreconnected(() => setConnectionStatus('Connected'))
        connection.onclose(() => setConnectionStatus('Disconnected'))

        connection.on("SessionStarted", async (sessionData) => {
            console.log("Session started:", sessionData)
            setActiveSession(sessionData)
            setMarkedStudents([])
            
            try {
                const students = await enrollmentService.getCourseEnrollments(sessionData.courseId)
                setEnrolledStudents(students)
            } catch (err) {
                console.error("Failed to fetch enrolled students:", err)
            }
        })

        connection.on("SessionEnded", () => {
            console.log("Session ended")
            setActiveSession(null)
            setEnrolledStudents([])
        })

        connection.on("AttendanceMarked", (attendanceRecord) => {
            console.log("Attendance marked:", attendanceRecord)
            setMarkedStudents(prev => {
                if (prev.find(s => s.studentId === attendanceRecord.studentId)) return prev;
                return [attendanceRecord, ...prev]
            })
        })

        const startConnection = async () => {
            try {
                await connection.start()
                setConnectionStatus('Connected')
                console.log("SignalR Connected.")
            } catch (err) {
                setConnectionStatus('Connection Failed')
                console.error("SignalR Connection Error: ", err)
            }
        }

        startConnection()

        return () => {
            connection.stop()
        }
    }, [])

    const presentCount = markedStudents.length
    const totalCount = enrolledStudents.length || 0
    const absentCount = Math.max(0, totalCount - presentCount)
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    // List of students who haven't been marked yet
    const absentStudents = enrolledStudents.filter(
        enrollment => !markedStudents.some(marked => marked.studentId === enrollment.studentId)
    )

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
            {activeSession ? (
                <div className="dashboard-container">
                    <div className="dashboard-header glass" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '20px', borderLeft: '5px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Activity color="var(--primary)" /> Real-Time Attendance Monitoring
                                </h2>
                                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
                                    Live session active for Course ID: {activeSession.courseId}
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                <div className={`live-badge ${connectionStatus === 'Connected' ? 'success' : 'warning'}`}>
                                    <span className={`pulse-dot ${connectionStatus === 'Connected' ? '' : 'yellow'}`}></span> {connectionStatus === 'Connected' ? 'LIVE' : connectionStatus.toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Real-time SignalR Connection</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Stats Cards */}
                        <div className="glass-card stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Present</span>
                                <h3 className="stat-value">{presentCount}</h3>
                            </div>
                        </div>

                        <div className="glass-card stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                                <XCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Absent</span>
                                <h3 className="stat-value">{absentCount}</h3>
                            </div>
                        </div>

                        <div className="glass-card stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Attendance Rate</span>
                                <h3 className="stat-value">{attendanceRate}%</h3>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                        {/* Main Feed */}
                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <UsersIcon size={20} /> Attendant Students
                            </h3>
                            <div className="attendance-grid">
                                {markedStudents.length > 0 ? (
                                    markedStudents.map((student) => (
                                        <div key={student.studentId} className="student-chip present pulse-border">
                                            <div className="student-avatar">{student.studentName.charAt(0)}</div>
                                            <div className="student-details">
                                                <span className="student-name">{student.studentName}</span>
                                                <span className="student-id">ID: {student.studentId}</span>
                                            </div>
                                            <div className="status-indicator success"></div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        Waiting for students to be recognized...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Absents & Graph */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Live Distribution</h3>
                                <div className="chart-container">
                                    <div className="circular-chart">
                                        <svg viewBox="0 0 36 36" className="circular-svg">
                                            <path className="circle-bg"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path className="circle"
                                                strokeDasharray={`${attendanceRate}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <text x="18" y="20.35" className="percentage">{attendanceRate}%</text>
                                        </svg>
                                    </div>
                                    <div className="chart-legend">
                                        <div className="legend-item"><span className="dot success"></span> Present</div>
                                        <div className="legend-item"><span className="dot danger"></span> Pending</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', flex: 1 }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--danger)' }}>Absent / Pending</h3>
                                <div className="absent-list">
                                    {absentStudents.length > 0 ? (
                                        absentStudents.map((student) => (
                                            <div key={student.studentId} className="absent-item">
                                                <span>{student.studentName}</span>
                                                <span className="id-badge">#{student.studentId}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', color: 'var(--success)' }}>Everyone is here!</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="welcome-dashboard">
                    <div className="glass hero-section" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center' }}>
                        <div className="welcome-icon">🎓</div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Power Campus</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                            Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.name}</span>
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div className="glass info-card">
                                <h3>Quick Actions</h3>
                                <p>Manage your courses, view grades, and monitor attendance in real-time.</p>
                            </div>
                            <div className="glass info-card highlight">
                                <h3>Real-Time Ready</h3>
                                <p>The system is connected and waiting for an attendance session to start.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
