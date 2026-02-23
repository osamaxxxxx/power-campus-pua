import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import scheduleService from '../api/scheduleService'
import courseService from '../api/courseService'
import { Calendar, Clock, MapPin, User, Plus, Edit3, Trash2, X } from 'lucide-react'

const Schedule = () => {
    const { user } = useAuth()
    const [schedules, setSchedules] = useState([])
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState(null)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
    const [formData, setFormData] = useState({
        courseId: '',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        room: ''
    })

    const isInstructor = user.role === 'Instructor' || user.role === 'Admin'

    useEffect(() => {
        loadSchedule()
        if (isInstructor) {
            loadCourses()
        }
    }, [user])

    const loadSchedule = async () => {
        try {
            setLoading(true)
            let data = []
            if (user.role === 'Student') {
                data = await scheduleService.getStudentSchedule(user.id)
            } else if (user.role === 'Instructor') {
                data = await scheduleService.getInstructorSchedule(user.id)
            } else {
                data = []
            }
            setSchedules(data)
        } catch (error) {
            console.error('Failed to load schedule:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadCourses = async () => {
        try {
            const data = await courseService.getAllCourses()
            setCourses(data)
        } catch (error) {
            console.error('Failed to load courses:', error)
        }
    }

    const handleCreateSchedule = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                courseId: parseInt(formData.courseId),
                dayOfWeek: parseInt(formData.dayOfWeek),
                startTime: formData.startTime + ':00',
                endTime: formData.endTime + ':00',
                room: formData.room
            }
            if (editingSchedule) {
                await scheduleService.updateSchedule(editingSchedule.id, payload)
            } else {
                await scheduleService.createSchedule(payload)
            }
            setShowModal(false)
            setEditingSchedule(null)
            loadSchedule()
        } catch (error) {
            console.error('Failed to save schedule:', error)
        }
    }

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule)
        setFormData({
            courseId: schedule.courseId.toString(),
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime.substring(0, 5),
            endTime: schedule.endTime.substring(0, 5),
            room: schedule.room || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this schedule entry?')) return
        try {
            await scheduleService.deleteSchedule(id)
            loadSchedule()
        } catch (error) {
            console.error('Failed to delete schedule:', error)
        }
    }

    const openCreateModal = () => {
        setEditingSchedule(null)
        setFormData({
            courseId: courses.length > 0 ? courses[0].id.toString() : '',
            dayOfWeek: currentDayIndex === 6 ? 0 : currentDayIndex + 1,
            startTime: '08:00',
            endTime: '09:30',
            room: ''
        })
        setShowModal(true)
    }

    const dayNameMap = {
        0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
    }

    const filteredSchedules = schedules.filter(s => dayNameMap[s.dayOfWeek] === days[currentDayIndex])

    const dayColors = [
        'rgba(99, 102, 241, 0.12)',   // Mon - Indigo
        'rgba(16, 185, 129, 0.12)',   // Tue - Green
        'rgba(245, 158, 11, 0.12)',   // Wed - Amber
        'rgba(239, 68, 68, 0.12)',    // Thu - Red
        'rgba(139, 92, 246, 0.12)',   // Fri - Purple
        'rgba(6, 182, 212, 0.12)',    // Sat - Cyan
        'rgba(107, 114, 128, 0.12)',  // Sun - Gray
    ]

    const dayAccentColors = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280'
    ]

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Class Schedule</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Stay organized with your weekly timetable</p>
                </div>
                {isInstructor && (
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreateModal}>
                        <Plus size={20} />
                        <span>Add Schedule</span>
                    </button>
                )}
            </div>

            {/* Day tabs */}
            <div className="glass" style={{ padding: '0.75rem', borderRadius: '20px', marginBottom: '2rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {days.map((day, index) => (
                    <button
                        key={day}
                        onClick={() => setCurrentDayIndex(index)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: currentDayIndex === index ? 'var(--primary)' : 'transparent',
                            color: currentDayIndex === index ? 'white' : 'var(--text-muted)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem'
                        }}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Schedule cards */}
            {loading ? (
                <div className="loading">Loading schedule...</div>
            ) : filteredSchedules.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredSchedules.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item, idx) => (
                        <div key={item.id} className="glass" style={{
                            padding: '1.5rem',
                            borderRadius: '20px',
                            display: 'grid',
                            gridTemplateColumns: '150px 1fr auto',
                            alignItems: 'center',
                            gap: '2rem',
                            borderLeft: `4px solid ${dayAccentColors[currentDayIndex]}`,
                            transition: 'var(--transition)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: dayAccentColors[currentDayIndex], fontWeight: '700' }}>
                                    <Clock size={16} />
                                    <span>{item.startTime.substring(0, 5)}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '24px' }}>
                                    to {item.endTime.substring(0, 5)}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{item.courseName}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <User size={14} />
                                        <span>{item.instructorName}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={14} />
                                        <span>Room: {item.room}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    background: dayColors[currentDayIndex],
                                    padding: '0.5rem 1rem',
                                    borderRadius: '100px',
                                    color: dayAccentColors[currentDayIndex],
                                    fontWeight: '600',
                                    fontSize: '0.8rem'
                                }}>
                                    {days[currentDayIndex]}
                                </div>
                                {isInstructor && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            style={{
                                                background: 'rgba(99, 102, 241, 0.1)', border: 'none',
                                                padding: '8px', borderRadius: '10px', cursor: 'pointer',
                                                color: 'var(--primary)', transition: 'var(--transition)'
                                            }}
                                            title="Edit"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                                                padding: '8px', borderRadius: '10px', cursor: 'pointer',
                                                color: 'var(--danger)', transition: 'var(--transition)'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass" style={{ padding: '4rem', borderRadius: '24px', textAlign: 'center' }}>
                    <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No classes scheduled for {days[currentDayIndex]}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {isInstructor ? 'Click "Add Schedule" to create a new entry.' : 'Enjoy your free time!'}
                    </p>
                </div>
            )}

            {/* ── Create / Edit Schedule Modal ── */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
                }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingSchedule(null) }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSchedule}>
                            <div className="form-group">
                                <label>Course</label>
                                <select
                                    required
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text)', fontSize: '0.875rem'
                                    }}
                                >
                                    <option value="">Select a course...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Day of Week</label>
                                <select
                                    required
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '12px',
                                        border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text)', fontSize: '0.875rem'
                                    }}
                                >
                                    <option value={0}>Sunday</option>
                                    <option value={1}>Monday</option>
                                    <option value={2}>Tuesday</option>
                                    <option value={3}>Wednesday</option>
                                    <option value={4}>Thursday</option>
                                    <option value={5}>Friday</option>
                                    <option value={6}>Saturday</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <div className="input-with-icon">
                                        <Clock className="input-icon" size={18} />
                                        <input
                                            type="time" required
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <div className="input-with-icon">
                                        <Clock className="input-icon" size={18} />
                                        <input
                                            type="time" required
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Room</label>
                                <div className="input-with-icon">
                                    <MapPin className="input-icon" size={18} />
                                    <input
                                        type="text" required
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        placeholder="e.g., Building A - Room 301"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" style={{ background: 'var(--surface)' }} onClick={() => { setShowModal(false); setEditingSchedule(null) }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingSchedule ? 'Update Schedule' : 'Create Schedule'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Schedule
