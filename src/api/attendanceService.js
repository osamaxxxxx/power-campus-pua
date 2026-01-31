import API from './axios'

const attendanceService = {
    getStudentAttendance: async (studentId) => {
        const response = await API.get(`/api/Attendance/student/${studentId}`)
        return response.data
    },

    getCourseAttendance: async (courseId) => {
        const response = await API.get(`/api/Attendance/course/${courseId}`)
        return response.data
    },

    markAttendance: async (attendanceData) => {
        const response = await API.post('/api/Attendance', attendanceData)
        return response.data
    }
}

export default attendanceService
