import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import gradeService from '../api/gradeService'
import courseService from '../api/courseService'
import enrollmentService from '../api/enrollmentService'
import { GraduationCap, Book, User, Plus, Search, Percent, TrendingUp, ChevronRight, Award } from 'lucide-react'

const Grades = () => {
    const { user } = useAuth()
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [students, setStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [grades, setGrades] = useState([])
    const [studentGrades, setStudentGrades] = useState([])
    const [filteredStudentGrades, setFilteredStudentGrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        studentId: '',
        courseId: '',
        assignmentName: '',
        score: '',
        maxScore: '100'
    })
    const [editingGrade, setEditingGrade] = useState(null)

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
        setSelectedStudent(null)
        setFilteredStudentGrades([])
        try {
            const gradeData = await gradeService.getCourseGrades(course.id)
            setGrades(gradeData)

            const enrollmentData = await enrollmentService.getCourseEnrollments(course.id)
            setStudents(enrollmentData)
        } catch (error) {
            console.error('Failed to load course grades:', error)
            setGrades([])
            setStudents([])
        }
    }

    const handleStudentSelect = (student) => {
        setSelectedStudent(student)
        // Filter grades for this specific student in the selected course
        const studentSpecificGrades = grades.filter(g => g.studentId === student.studentId)
        setFilteredStudentGrades(studentSpecificGrades)
    }

    const handleSubmitGrade = async (e) => {
        e.preventDefault()
        try {
            const gradePayload = {
                ...formData,
                studentId: parseInt(formData.studentId),
                courseId: selectedCourse.id,
                score: parseFloat(formData.score),
                maxScore: parseFloat(formData.maxScore)
            }

            if (editingGrade) {
                await gradeService.updateGrade(editingGrade.id, {
                    assignmentName: formData.assignmentName,
                    score: parseFloat(formData.score),
                    maxScore: parseFloat(formData.maxScore)
                })
            } else {
                await gradeService.submitGrade(gradePayload)
            }
            
            setShowModal(false)
            setEditingGrade(null)
            // Refresh grades
            const gradeData = await gradeService.getCourseGrades(selectedCourse.id)
            setGrades(gradeData)
            // Refresh the selected student's grades
            if (selectedStudent) {
                const studentSpecificGrades = gradeData.filter(g => g.studentId === selectedStudent.studentId)
                setFilteredStudentGrades(studentSpecificGrades)
            }
        } catch (error) {
            console.error('Failed to submit grade:', error)
        }
    }

    const openAddGradeModal = (student = null) => {
        setEditingGrade(null)
        setFormData({
            studentId: student ? student.studentId.toString() : '',
            courseId: '',
            assignmentName: '',
            score: '',
            maxScore: '100'
        })
        setShowModal(true)
    }

    const openEditGradeModal = (grade) => {
        setEditingGrade(grade)
        setFormData({
            studentId: grade.studentId.toString(),
            courseId: grade.courseId.toString(),
            assignmentName: grade.assignmentName,
            score: grade.score.toString(),
            maxScore: grade.maxScore.toString()
        })
        setShowModal(true)
    }

    const filteredStudents = students.filter(s =>
        s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.toString().includes(searchTerm)
    )

    // ─── Student View ───
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

    // ─── Instructor / Admin View ───
    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Grade Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Submit and manage student grades</p>
                </div>
                {selectedCourse && selectedStudent && (
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => openAddGradeModal(selectedStudent)}>
                        <Plus size={20} />
                        <span>Add Grade</span>
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 260px 1fr', gap: '1.5rem' }}>
                {/* ── Column 1: Course List ── */}
                <div>
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Courses</h3>
                    <div className="glass" style={{ borderRadius: '16px', padding: '0.5rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => handleCourseSelect(course)}
                                style={{
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    background: selectedCourse?.id === course.id ? 'var(--primary)' : 'transparent',
                                    color: selectedCourse?.id === course.id ? 'white' : 'inherit',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <Book size={16} opacity={0.7} />
                                <div style={{ fontSize: '0.85rem', fontWeight: selectedCourse?.id === course.id ? '600' : '400' }}>{course.title}</div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No courses found</div>
                        )}
                    </div>
                </div>

                {/* ── Column 2: Student List ── */}
                <div>
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Students</h3>
                    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', maxHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                        {selectedCourse ? (
                            <>
                                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%', padding: '8px 8px 8px 34px', borderRadius: '10px',
                                                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)',
                                                color: 'var(--text)', fontSize: '0.8rem'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ overflowY: 'auto', padding: '0.5rem' }}>
                                    {filteredStudents.length > 0 ? filteredStudents.map(student => {
                                        const hasGrades = grades.some(g => g.studentId === student.studentId)
                                        return (
                                            <div
                                                key={student.studentId}
                                                className={`student-list-item ${selectedStudent?.studentId === student.studentId ? 'active' : ''}`}
                                                onClick={() => handleStudentSelect(student)}
                                            >
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                    background: selectedStudent?.studentId === student.studentId ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    <User size={16} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {student.studentName}
                                                    </div>
                                                    <div className="student-id">ID: #{student.studentId}</div>
                                                </div>
                                                {hasGrades && (
                                                    <div style={{
                                                        marginLeft: 'auto', width: '8px', height: '8px',
                                                        borderRadius: '50%', background: 'var(--success)', flexShrink: 0
                                                    }} title="Has grades" />
                                                )}
                                            </div>
                                        )
                                    }) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            No students enrolled
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                <User size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a course first</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Column 3: Grade Details ── */}
                <div>
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {selectedStudent ? `${selectedStudent.studentName}'s Grades` : 'Grade Details'}
                    </h3>
                    {!selectedCourse ? (
                        <div className="glass" style={{ height: '400px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                            <GraduationCap size={56} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>Gradebook</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '280px', fontSize: '0.9rem' }}>Select a course, then a student to view and manage their grades.</p>
                        </div>
                    ) : !selectedStudent ? (
                        <div className="glass" style={{ height: '400px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                            <User size={56} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>Select a Student</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '280px', fontSize: '0.9rem' }}>
                                Choose a student from <strong>{selectedCourse.title}</strong> to view their grades.
                            </p>
                        </div>
                    ) : (
                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            {/* Student header */}
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '14px',
                                        background: 'rgba(99, 102, 241, 0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <User size={22} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{selectedStudent.studentName}</h3>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {selectedCourse.title} • ID: #{selectedStudent.studentId}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
                                    onClick={() => openAddGradeModal(selectedStudent)}
                                >
                                    <Plus size={16} />
                                    <span>Add</span>
                                </button>
                            </div>

                            {/* Summary stats */}
                            {filteredStudentGrades.length > 0 && (
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Assignments</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{filteredStudentGrades.length}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Average</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                            {(filteredStudentGrades.reduce((acc, g) => acc + g.percentage, 0) / filteredStudentGrades.length).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grades table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem' }}>ASSIGNMENT</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem' }}>SCORE</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem' }}>PERCENTAGE</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudentGrades.length > 0 ? filteredStudentGrades.map(g => (
                                        <tr key={g.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Award size={16} color="var(--primary)" style={{ opacity: 0.6 }} />
                                                    <span style={{ fontWeight: '500' }}>{g.assignmentName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{g.score}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {g.maxScore}</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <div style={{ width: '50px', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${g.percentage}%`, height: '100%', background: g.percentage >= 50 ? 'var(--success)' : 'var(--danger)', borderRadius: '10px' }}></div>
                                                    </div>
                                                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: g.percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                                                        {g.percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <button 
                                                    className="btn" 
                                                    style={{ width: 'auto', padding: '6px', background: 'rgba(99, 102, 241, 0.1)' }}
                                                    onClick={() => openEditGradeModal(g)}
                                                >
                                                    <Plus size={14} style={{ transform: 'rotate(45deg)' }} /> 
                                                    {/* Using Plus rotated as a simple edit/cross icon if Edit2 is not available, but Edit2 is available in Users.jsx, let me check icons */}
                                                    {/* Actually, let's use Edit2 if possible. I'll check the imports. */}
                                                    <span style={{ fontSize: '0.75rem' }}>Edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <Award size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                                <div>No grades recorded yet</div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Click "Add" to submit a grade for this student</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add Grade Modal ── */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
                }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingGrade ? 'Update Grade' : 'Submit Grade'}</h2>
                        <form onSubmit={handleSubmitGrade}>
                            <div className="form-group">
                                <label>Select Student</label>
                                <select
                                    required
                                    disabled={!!editingGrade}
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text)', fontSize: '0.875rem',
                                        opacity: editingGrade ? 0.6 : 1
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
                                <button type="button" className="btn" style={{ background: 'var(--surface)' }} onClick={() => { setShowModal(false); setEditingGrade(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingGrade ? 'Update Grade' : 'Submit Grade'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Grades
