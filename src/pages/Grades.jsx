import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import gradeService from '../api/gradeService'
import courseService from '../api/courseService'
import enrollmentService from '../api/enrollmentService'
import { GraduationCap, Book, User, Plus, Search, Percent, TrendingUp } from 'lucide-react'

const Grades = () => {
    const { user } = useAuth()
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [students, setStudents] = useState([])
    const [grades, setGrades] = useState([])
    const [studentGrades, setStudentGrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        studentId: '',
        courseId: '',
        assignmentName: '',
        score: '',
        maxScore: '100'
    })

    useEffect(() => {
        if (user.role === 'Student') {
            loadStudentGrades()
        } else {
            loadInstructorCourses()
        }
    }, [user])

    const loadStudentGrades = async () => {
        try {
            setLoading(true)
            const data = await gradeService.getStudentGrades(user.id)
            setStudentGrades(data)
        } catch (error) {
            console.error('Failed to load grades:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadInstructorCourses = async () => {
        try {
            setLoading(true)
            const data = await courseService.getAllCourses()
            setCourses(data)
        } catch (error) {
            console.error('Failed to load courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCourseSelect = async (course) => {
        setSelectedCourse(course)
        try {
            const gradeData = await gradeService.getCourseGrades(course.id)
            setGrades(gradeData)

            // Get enrolled students to grade them even if they don't have grades yet
            const enrollmentData = await enrollmentService.getCourseEnrollments(course.id)
            setStudents(enrollmentData)
        } catch (error) {
            console.error('Failed to load course grades:', error)
            setGrades([])
            setStudents([])
        }
    }

    const handleSubmitGrade = async (e) => {
        e.preventDefault()
        try {
            await gradeService.submitGrade({
                ...formData,
                studentId: parseInt(formData.studentId),
                courseId: selectedCourse.id,
                score: parseFloat(formData.score),
                maxScore: parseFloat(formData.maxScore)
            })
            setShowModal(false)
            handleCourseSelect(selectedCourse)
        } catch (error) {
            console.error('Failed to submit grade:', error)
        }
    }

    if (user.role === 'Student') {
        const average = studentGrades.length > 0
            ? (studentGrades.reduce((acc, g) => acc + g.percentage, 0) / studentGrades.length).toFixed(1)
            : 0

        return (
            <div className="page-container">
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <h1>Academic Performance</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View your grades and overall progress</p>
                </div>

                <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '14px' }}>
                            <TrendingUp color="var(--primary)" size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GPA / Average</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{average}%</div>
                        </div>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '14px' }}>
                            <Book color="var(--success)" size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Assignments</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{studentGrades.length}</div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading grades...</div>
                ) : (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>COURSE</th>
                                    <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>ASSIGNMENT</th>
                                    <th style={{ padding: '1.2rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>SCORE</th>
                                    <th style={{ padding: '1.2rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>PERCENTAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentGrades.length > 0 ? studentGrades.map(g => (
                                    <tr key={g.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontWeight: '600' }}>{g.courseName}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>{g.assignmentName}</td>
                                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                            <span style={{ fontWeight: '600' }}>{g.score}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {g.maxScore}</span>
                                        </td>
                                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${g.percentage}%`, height: '100%', background: g.percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}></div>
                                                </div>
                                                <span style={{ fontWeight: '600', minWidth: '40px', color: g.percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}>{g.percentage.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No grades available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )
    }

    // Instructor View
    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Grade Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Submit and manage student grades</p>
                </div>
                {selectedCourse && (
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setFormData({ ...formData, studentId: '', assignmentName: '', score: '' }); setShowModal(true); }}>
                        <Plus size={20} />
                        <span>Submit New Grade</span>
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                <div className="course-list">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Select Course</h3>
                    <div className="glass" style={{ borderRadius: '16px', padding: '0.5rem' }}>
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => handleCourseSelect(course)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    background: selectedCourse?.id === course.id ? 'var(--primary)' : 'transparent',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <Book size={18} opacity={0.7} />
                                <div style={{ fontSize: '0.9rem', fontWeight: selectedCourse?.id === course.id ? '600' : '400' }}>{course.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grade-table">
                    {!selectedCourse ? (
                        <div className="glass" style={{ height: '400px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                            <GraduationCap size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                            <h3>Gradebook</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>Select a course to view the gradebook and record new grades.</p>
                        </div>
                    ) : (
                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>{selectedCourse.title} - Gradebook</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <tr>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>STUDENT</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>ASSIGNMENT</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>SCORE</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {students.length > 0 ? students.map(student => {
                                        const studentGrade = grades.find(g => g.studentId === student.studentId);
                                        return (
                                            <tr key={student.studentId} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '1.2rem' }}>
                                                    <div style={{ fontWeight: '600' }}>{student.studentName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{student.studentId}</div>
                                                </td>
                                                <td style={{ padding: '1.2rem' }}>
                                                    {studentGrade ? studentGrade.assignmentName : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No assignment</span>}
                                                </td>
                                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                                    {studentGrade ? (
                                                        <>
                                                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{studentGrade.score} / {studentGrade.maxScore}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{studentGrade.percentage.toFixed(1)}%</div>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No students enrolled in this course yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
                }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Submit Grade</h2>
                        <form onSubmit={handleSubmitGrade}>
                            <div className="form-group">
                                <label>Select Student</label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <option value="">Choose a student...</option>
                                    {students.map(student => (
                                        <option key={student.studentId} value={student.studentId}>
                                            {student.studentName} (ID: {student.studentId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assignment / Exam Name</label>
                                <div className="input-with-icon">
                                    <Book className="input-icon" size={20} />
                                    <input
                                        type="text" required
                                        value={formData.assignmentName}
                                        onChange={(e) => setFormData({ ...formData, assignmentName: e.target.value })}
                                        placeholder="Midterm, Final, Homework 1..."
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Score</label>
                                    <div className="input-with-icon">
                                        <Percent className="input-icon" size={20} />
                                        <input
                                            type="number" step="0.5" required
                                            value={formData.score}
                                            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Max Score</label>
                                    <div className="input-with-icon">
                                        <Percent className="input-icon" size={20} />
                                        <input
                                            type="number" required
                                            value={formData.maxScore}
                                            onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--surface)' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Grade</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Grades
