import { useState, useEffect } from 'react'
import userService from '../api/userService'
import { Plus, Edit2, Trash2, UserPlus, Mail, Shield, Search, GraduationCap, Users as UsersIcon } from 'lucide-react'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [activeTab, setActiveTab] = useState('students') // 'students' or 'instructors'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student'
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const data = await userService.getAllUsers()
            setUsers(data)
        } catch (error) {
            console.error('Failed to load users:', error)
        } finally {
            setLoading(false)
        }
    }

    // Map role strings to enum integer values
    const roleMap = { 'Admin': 0, 'Instructor': 1, 'Student': 2 }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: roleMap[formData.role]
            }
            if (editingUser) {
                await userService.updateUser(editingUser.id, payload)
            } else {
                await userService.createUser(payload)
            }
            setShowModal(false)
            setEditingUser(null)
            setFormData({ name: '', email: '', password: '', role: 'Student' })
            loadUsers()
        } catch (error) {
            console.error('Failed to save user:', error)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(id)
                loadUsers()
            } catch (error) {
                console.error('Failed to delete user:', error)
            }
        }
    }

    const openAddModal = (role) => {
        setEditingUser(null)
        setFormData({ name: '', email: '', password: '', role })
        setShowModal(true)
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTab = activeTab === 'students' ? user.role === 'Student' : user.role === 'Instructor'
        return matchesSearch && matchesTab
    })

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>User Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage instructors and students</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => openAddModal(activeTab === 'students' ? 'Student' : 'Instructor')}
                >
                    <Plus size={20} />
                    <span>Add {activeTab === 'students' ? 'Student' : 'Instructor'}</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="glass" style={{ padding: '0.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('students')}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'students' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'students' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <GraduationCap size={20} />
                    Students ({users.filter(u => u.role === 'Student').length})
                </button>
                <button
                    onClick={() => setActiveTab('instructors')}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'instructors' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'instructors' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <UsersIcon size={20} />
                    Instructors ({users.filter(u => u.role === 'Instructor').length})
                </button>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <div className="input-with-icon">
                    <Search className="input-icon" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'var(--background)' }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredUsers.map(user => (
                        <div key={user.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="user-avatar" style={{ width: '48px', height: '48px', borderRadius: '12px' }}>
                                    <Shield size={24} color={user.role === 'Instructor' ? 'var(--warning)' : 'var(--success)'} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{user.name}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '100px',
                                        background: user.role === 'Instructor' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: user.role === 'Instructor' ? 'var(--warning)' : 'var(--success)',
                                        border: `1px solid ${user.role === 'Instructor' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                    }}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>
                                    <Mail size={14} />
                                    <span>{user.email}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn" style={{ background: 'var(--background)', padding: '8px' }} onClick={() => { setEditingUser(user); setFormData({ name: user.name, email: user.email, password: '', role: user.role }); setShowModal(true); }}>
                                    <Edit2 size={16} color="var(--primary)" />
                                </button>
                                <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px' }} onClick={() => handleDelete(user.id)}>
                                    <Trash2 size={16} color="var(--danger)" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px', background: 'var(--surface)' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>{editingUser ? `Edit ${formData.role}` : `Add New ${formData.role}`}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Full Name</label>
                                <div className="input-with-icon">
                                    <UserPlus className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ background: 'var(--background)' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ background: 'var(--background)' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Password {editingUser && '(Leave blank to keep current)'}</label>
                                <div className="input-with-icon">
                                    <Shield className="input-icon" size={20} />
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        style={{ background: 'var(--background)' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--background)', color: 'var(--text)' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save {formData.role}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
