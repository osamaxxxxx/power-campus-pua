import { useState, useEffect } from 'react'
import enrollmentService from '../api/enrollmentService'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, User, Clock, Calendar } from 'lucide-react'

const MyCourses = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            fetchMyCourses()
        }
    }, [user])

    const fetchMyCourses = async () => {
        try {
            const data = await enrollmentService.getStudentCourses(user.id)
            setCourses(data)
        } catch (err) {
            console.error('Error fetching my courses:', err)
            setError('Failed to load your courses. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const handleDropCourse = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to drop this course?')) {
            try {
                await enrollmentService.dropCourse(enrollmentId)
                fetchMyCourses()
            } catch (err) {
                console.error('Failed to drop course:', err)
                alert('Failed to drop course. Please try again.')
            }
        }
    }

    if (loading) return <div className="loading">Loading your courses...</div>
    if (error) return <div className="error-message">{error}</div>

    return (
        <div className="courses-container" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>My Courses</h1>
                <p style={{ color: 'var(--text-muted)' }}>Courses you are currently enrolled in</p>
            </header>

            {courses.length === 0 ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h3>No courses found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't enrolled in any courses yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map(enrollment => (
                        <div key={enrollment.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, flex: 1 }}>{enrollment.courseName}</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} className="text-muted" />
                                    <span>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDropCourse(enrollment.id)}
                                className="btn"
                                style={{
                                    marginTop: 'auto',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--danger)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                Drop Course
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyCourses
