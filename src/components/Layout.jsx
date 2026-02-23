import { useState } from 'react'
import logoImg from '../assets/logo-english.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    GraduationCap,
    ClipboardCheck,
    LogOut,
    User as UserIcon,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react'

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/', roles: ['Instructor', 'Student'] },
        { icon: <UserIcon size={20} />, label: 'Users', path: '/users', roles: ['Admin'] },
        { icon: <BookOpen size={20} />, label: 'Courses', path: '/courses', roles: ['Instructor', 'Student'] },
        { icon: <BookOpen size={20} />, label: 'My Courses', path: '/my-courses', roles: ['Student'] },
        { icon: <Calendar size={20} />, label: 'Schedule', path: '/schedule', roles: ['Instructor', 'Student'] },
        { icon: <ClipboardCheck size={20} />, label: 'Attendance', path: '/attendance', roles: ['Instructor', 'Student'] },
        { icon: <GraduationCap size={20} />, label: 'Grades', path: '/grades', roles: ['Instructor', 'Student'] },
    ]

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role))

    return (
        <div className="dashboard-layout">
            <button
                className="mobile-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                <Menu size={24} />
            </button>

            <div
                className={`overlay ${isMobileMenuOpen ? 'visible' : ''}`}
                onClick={closeMobileMenu}
            />

            <aside className={`sidebar glass ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logoImg} alt="Power Campus" className="sidebar-logo" />
                    <h2>Power Campus</h2>
                    {isMobileMenuOpen && (
                        <button
                            onClick={closeMobileMenu}
                            style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {filteredMenu.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <div className="user-info">
                        <div className="user-avatar">
                            <UserIcon size={20} />
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    )
}

export default Layout
