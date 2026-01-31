import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import scheduleService from '../api/scheduleService'
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react'

const Schedule = () => {
    const { user } = useAuth()
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)

    useEffect(() => {
        loadSchedule()
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
                // Admin maybe sees everything? For now just empty or first 10
                data = []
            }
            setSchedules(data)
        } catch (error) {
            console.error('Failed to load schedule:', error)
        } finally {
            setLoading(false)
        }
    }

    const dayNameMap = {
        0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
    }

    const filteredSchedules = schedules.filter(s => dayNameMap[s.dayOfWeek] === days[currentDayIndex])

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1>Class Schedule</h1>
                <p style={{ color: 'var(--text-muted)' }}>Stay organized with your weekly timetable</p>
            </div>

            <div className="glass" style={{ padding: '1rem', borderRadius: '20px', marginBottom: '2rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
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
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">Loading schedule...</div>
            ) : filteredSchedules.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredSchedules.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                        <div key={item.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'grid', gridTemplateColumns: '150px 1fr auto', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700' }}>
                                    <Clock size={16} />
                                    <span>{item.startTime.substring(0, 5)}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '24px' }}>
                                    to {item.endTime.substring(0, 5)}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.courseName}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
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

                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.8rem' }}>
                                Upcoming
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass" style={{ padding: '4rem', borderRadius: '24px', textAlign: 'center' }}>
                    <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No classes scheduled for {days[currentDayIndex]}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enjoy your free time!</p>
                </div>
            )}
        </div>
    )
}

export default Schedule
