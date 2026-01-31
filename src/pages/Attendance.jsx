import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import attendanceService from '../api/attendanceService'
import courseService from '../api/courseService'
import lectureService from '../api/lectureService'
import enrollmentService from '../api/enrollmentService'
import { Search, Calendar, ChevronRight, CheckCircle2, XCircle, Clock, BookOpen, Plus, X } from 'lucide-react'

const Attendance = () => {
    const { user } = useAuth()
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [lectures, setLectures] = useState([])
    const [selectedLecture, setSelectedLecture] = useState(null)
    const [enrolledStudents, setEnrolledStudents] = useState([])
    const [attendanceRecords, setAttendanceRecords] = useState([])
    const [studentAttendance, setStudentAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [showLectureModal, setShowLectureModal] = useState(false)
    const [lectureFormData, setLectureFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:30'
    })

    useEffect(() => {
        if (user.role === 'Student') {
            loadStudentAttendance()
        } else {
            loadInstructorCourses()
        }
    }, [user])

    const loadStudentAttendance = async () => {
        try {
            setLoading(true)
            const data = await attendanceService.getStudentAttendance(user.id)
            setStudentAttendance(data)
        } catch (error) {
            console.error('Failed to load attendance:', error)
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
        setSelectedLecture(null)
        setEnrolledStudents([])
        setAttendanceRecords([])
        try {
            const lectureData = await lectureService.getCourseLectures(course.id)
            setLectures(lectureData)

            // Load enrolled students for this course
            const enrollments = await enrollmentService.getCourseEnrollments(course.id)
            setEnrolledStudents(enrollments)
        } catch (error) {
            console.error('Failed to load course data:', error)
            setLectures([])
            setEnrolledStudents([])
        }
    }

    const handleLectureSelect = async (lecture) => {
        setSelectedLecture(lecture)
        try {
            const data = await attendanceService.getCourseAttendance(selectedCourse.id)
            const filtered = data.filter(a => a.lectureId === lecture.id)
            setAttendanceRecords(filtered)
        } catch (error) {
            console.error('Failed to load lecture attendance:', error)
            setAttendanceRecords([])
        }
    }

    const handleMarkAttendance = async (studentId, isPresent) => {
        try {
            const attendanceData = {
                studentId,
                courseId: selectedCourse.id,
                lectureId: selectedLecture.id,
                date: selectedLecture.date,
                isPresent
            }
            await attendanceService.markAttendance(attendanceData)
            handleLectureSelect(selectedLecture)
        } catch (error) {
            console.error('Failed to mark attendance:', error)
        }
    }

    const handleCreateLecture = async (e) => {
        e.preventDefault()
        try {
            await lectureService.createLecture({
                courseId: selectedCourse.id,
                title: lectureFormData.title,
                description: lectureFormData.description,
                date: lectureFormData.date,
                startTime: lectureFormData.startTime,
                endTime: lectureFormData.endTime
            })
            setShowLectureModal(false)
            setLectureFormData({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '10:30'
            })
            handleCourseSelect(selectedCourse)
        } catch (error) {
            console.error('Failed to create lecture:', error)
            alert('Failed to create lecture. Please try again.')
        }
    }

    // Merge enrolled students with attendance records
    const getStudentAttendanceList = () => {
        return enrolledStudents.map(enrollment => {
            const attendanceRecord = attendanceRecords.find(a => a.studentId === enrollment.studentId)
            return {
                studentId: enrollment.studentId,
                studentName: enrollment.studentName,
                isPresent: attendanceRecord ? attendanceRecord.isPresent : false,
                hasRecord: !!attendanceRecord
            }
        })
    }

    if (user.role === 'Student') {
        return (
            <div className="page-container">
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <h1>My Attendance</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track your presence in courses</p>
                </div>

                {loading ? (
                    <div className="loading">Loading attendance...</div>
                ) : (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>Course</th>
                                    <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>Lecture / Date</th>
                                    <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentAttendance.length > 0 ? studentAttendance.map(a => (
                                    <tr key={a.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontWeight: '600' }}>{a.courseName}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontSize: '0.9rem' }}>{a.lectureTitle || 'Regular Session'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 12px',
                                                borderRadius: '100px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: a.isPresent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: a.isPresent ? 'var(--success)' : 'var(--danger)',
                                                border: `1px solid ${a.isPresent ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                            }}>
                                                {a.isPresent ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                {a.isPresent ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No attendance records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )
    }

    // Instructor / Admin View
    const studentList = getStudentAttendanceList()

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1>Manage Attendance</h1>
                <p style={{ color: 'var(--text-muted)' }}>Select a course and lecture to mark attendance</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                <div className="sidebar-selection">
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
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: selectedCourse?.id === course.id ? '600' : '400' }}>{course.title}</div>
                                <ChevronRight size={16} opacity={selectedCourse?.id === course.id ? 1 : 0.3} />
                            </div>
                        ))}
                    </div>

                    {selectedCourse && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>Lectures</h3>
                                <button
                                    className="btn"
                                    style={{
                                        background: 'var(--primary)',
                                        padding: '6px 10px',
                                        fontSize: '0.8rem',
                                        width: 'auto'
                                    }}
                                    onClick={() => setShowLectureModal(true)}
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                            <div className="glass" style={{ borderRadius: '16px', padding: '0.5rem' }}>
                                {lectures.length > 0 ? lectures.map(lecture => (
                                    <div
                                        key={lecture.id}
                                        onClick={() => handleLectureSelect(lecture)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'var(--transition)',
                                            background: selectedLecture?.id === lecture.id ? 'var(--surface)' : 'transparent',
                                            border: selectedLecture?.id === lecture.id ? '1px solid var(--primary)' : '1px solid transparent',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{lecture.title}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} />
                                            {new Date(lecture.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        No lectures yet. Click "Add" to create one.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="attendance-marking">
                    {!selectedCourse ? (
                        <div className="glass" style={{ height: '400px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <BookOpen size={48} color="var(--primary)" />
                            </div>
                            <h3>Welcome to Attendance Management</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>Please select a course from the left to begin marking attendance.</p>
                        </div>
                    ) : !selectedLecture ? (
                        <div className="glass" style={{ height: '400px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <Clock size={48} color="var(--warning)" />
                            </div>
                            <h3>Select a Lecture</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '350px' }}>
                                {enrolledStudents.length > 0
                                    ? `${enrolledStudents.length} student(s) enrolled. Select a lecture to mark attendance.`
                                    : 'No students enrolled in this course yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem' }}>{selectedLecture.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedCourse.title} - {new Date(selectedLecture.date).toLocaleDateString()}</p>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                                    {studentList.filter(s => s.isPresent).length} / {studentList.length} Present
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <tr>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>STUDENT NAME & ID</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>ATTENDANCE STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList.length > 0 ? studentList.map(student => (
                                        <tr key={student.studentId} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ fontWeight: '500' }}>{student.studentName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{student.studentId}</div>
                                            </td>
                                            <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleMarkAttendance(student.studentId, true)}
                                                        className={`btn ${student.isPresent ? 'btn-primary' : ''}`}
                                                        style={{
                                                            width: 'auto',
                                                            padding: '6px 16px',
                                                            fontSize: '0.8rem',
                                                            background: student.isPresent ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                                            color: student.isPresent ? 'white' : 'var(--text-muted)'
                                                        }}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkAttendance(student.studentId, false)}
                                                        className={`btn ${!student.isPresent && student.hasRecord ? 'btn-primary' : ''}`}
                                                        style={{
                                                            width: 'auto',
                                                            padding: '6px 16px',
                                                            fontSize: '0.8rem',
                                                            background: (!student.isPresent && student.hasRecord) ? 'var(--danger)' : 'rgba(255,255,255,0.05)',
                                                            color: (!student.isPresent && student.hasRecord) ? 'white' : 'var(--text-muted)'
                                                        }}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="2" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No students enrolled in this course.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Lecture Modal */}
            {showLectureModal && (
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
                            onClick={() => setShowLectureModal(false)}
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

                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Lecture</h2>
                        <form onSubmit={handleCreateLecture}>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Lecture Title</label>
                                <div className="input-with-icon">
                                    <BookOpen className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={lectureFormData.title}
                                        onChange={(e) => setLectureFormData({ ...lectureFormData, title: e.target.value })}
                                        placeholder="e.g., Week 5 - Data Structures"
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Description (Optional)</label>
                                <textarea
                                    value={lectureFormData.description}
                                    onChange={(e) => setLectureFormData({ ...lectureFormData, description: e.target.value })}
                                    placeholder="Brief description of lecture topics..."
                                    style={{
                                        width: '100%',
                                        minHeight: '60px',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Date</label>
                                <div className="input-with-icon">
                                    <Calendar className="input-icon" size={20} />
                                    <input
                                        type="date"
                                        required
                                        value={lectureFormData.date}
                                        onChange={(e) => setLectureFormData({ ...lectureFormData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <div className="input-with-icon">
                                        <Clock className="input-icon" size={20} />
                                        <input
                                            type="time"
                                            required
                                            value={lectureFormData.startTime}
                                            onChange={(e) => setLectureFormData({ ...lectureFormData, startTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <div className="input-with-icon">
                                        <Clock className="input-icon" size={20} />
                                        <input
                                            type="time"
                                            required
                                            value={lectureFormData.endTime}
                                            onChange={(e) => setLectureFormData({ ...lectureFormData, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--surface)' }} onClick={() => setShowLectureModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Lecture
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Attendance
