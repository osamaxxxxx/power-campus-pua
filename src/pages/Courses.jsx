import { useState, useEffect } from 'react'
import courseService from '../api/courseService'
import enrollmentService from '../api/enrollmentService'
import { BookOpen, Clock, User, PlusCircle, CheckCircle, X, Trash2, IdCard, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Courses = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showStudentsModal, setShowStudentsModal] = useState(false)
    const [selectedCourseStudents, setSelectedCourseStudents] = useState([])
    const [selectedCourseTitle, setSelectedCourseTitle] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        creditHours: 3,
        instructorId: null
    })
    const { user } = useAuth()

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const data = await courseService.getAllCourses()
            setCourses(data)
        } catch (err) {
            setError('Failed to load courses. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async (courseId) => {
        try {
            await courseService.enrollInCourse(courseId)
            alert('Successfully enrolled!')
        } catch (err) {
            console.error('Enrollment error:', err)
            const errorMessage = err.response?.data || 'Enrollment failed. Please try again.'
            alert(typeof errorMessage === 'string' ? errorMessage : 'Enrollment failed.')
        }
    }

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                await courseService.deleteCourse(courseId)
                fetchCourses()
            } catch (err) {
                console.error('Failed to delete course:', err)
                alert('Failed to delete course. You may not have permission.')
            }
        }
    }

    const handleCreateCourse = async (e) => {
        e.preventDefault()
        try {
            await courseService.createCourse({
                ...formData,
                creditHours: parseInt(formData.creditHours),
                instructorId: formData.instructorId ? parseInt(formData.instructorId) : user?.id || null
            })
            setShowModal(false)
            setFormData({ title: '', description: '', creditHours: 3, instructorId: null })
            fetchCourses()
        } catch (err) {
            console.error('Failed to create course:', err)
            alert('Failed to create course. Please try again.')
        }
    }

    const handleViewStudents = async (courseId, courseTitle) => {
        try {
            setSelectedCourseTitle(courseTitle)
            const students = await enrollmentService.getCourseEnrollments(courseId)
            setSelectedCourseStudents(students)
            setShowStudentsModal(true)
        } catch (err) {
            console.error('Failed to fetch enrolled students:', err)
            alert('Failed to fetch enrolled students.')
        }
    }

    if (loading) return <div className="loading">Loading courses...</div>
    if (error) return <div className="error-message">{error}</div>

    return (
        <div className="courses-container" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Available Courses</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Explore and enroll in the latest academic offerings</p>
                    {user?.role === 'Instructor' && (
                        <p style={{ color: 'var(--primary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            <IdCard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                            Your ID: <strong>{user?.id}</strong> | Name: <strong>{user?.name}</strong>
                        </p>
                    )}
                </div>
                {(user?.role === 'Admin' || user?.role === 'Instructor') && (
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={() => setShowModal(true)}
                    >
                        <PlusCircle size={18} /> Add New Course
                    </button>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {courses.map(course => (
                    <div key={course.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: 0, flex: 1 }}>{course.title}</h3>
                            <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {course.creditHours} Credits
                            </span>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flex: 1 }}>{course.description || 'No description available.'}</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                            <User size={16} className="text-muted" />
                            <span>Instructor: <strong>{course.instructorName || 'Not Assigned'}</strong></span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {user?.role === 'Student' && (
                                <button
                                    onClick={() => handleEnroll(course.id)}
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    <PlusCircle size={18} /> Enroll Now
                                </button>
                            )}

                            {user?.role === 'Instructor' && (
                                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                    <button
                                        onClick={() => handleViewStudents(course.id, course.title)}
                                        className="btn"
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: 'var(--primary)',
                                            flex: 1
                                        }}
                                    >
                                        <Users size={18} /> View Students
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="btn"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--danger)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            flex: 1
                                        }}
                                    >
                                        <Trash2 size={18} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Students List Modal */}
            {showStudentsModal && (
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
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => setShowStudentsModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={20} color="var(--text-muted)" />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem' }}>{selectedCourseTitle}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enrolled Students</p>

                        {selectedCourseStudents.length === 0 ? (
                            <p className="text-muted">No students enrolled in this course yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {selectedCourseStudents.map(student => (
                                    <div key={student.studentId || student.id} className="glass" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '50%' }}>
                                            <User size={20} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>{student.studentName}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>ID: {student.studentId}</p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(student.enrollmentDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Course Modal */}
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
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={20} color="var(--text-muted)" />
                        </button>

                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Course</h2>
                        <form onSubmit={handleCreateCourse}>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Course Title</label>
                                <div className="input-with-icon">
                                    <BookOpen className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Introduction to Computer Science"
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the course..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--background)',
                                        color: 'var(--text)',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Credit Hours</label>
                                <div className="input-with-icon">
                                    <Clock className="input-icon" size={20} />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="6"
                                        value={formData.creditHours}
                                        onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })}
                                        style={{ background: 'var(--background)' }}
                                    />
                                </div>
                            </div>

                            {user?.role === 'Admin' && (
                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label>Instructor ID (Optional)</label>
                                    <div className="input-with-icon">
                                        <User className="input-icon" size={20} />
                                        <input
                                            type="number"
                                            value={formData.instructorId || ''}
                                            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                                            placeholder="Leave empty to assign later"
                                            style={{ background: 'var(--background)' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--background)', color: 'var(--text)' }} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Courses
