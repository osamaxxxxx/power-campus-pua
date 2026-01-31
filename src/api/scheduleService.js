import API from './axios'

const scheduleService = {
    getStudentSchedule: async (studentId) => {
        const response = await API.get(`/api/Schedule/student/${studentId}`)
        return response.data
    },

    getInstructorSchedule: async (instructorId) => {
        const response = await API.get(`/api/Schedule/doctor/${instructorId}`)
        return response.data
    },

    createSchedule: async (scheduleData) => {
        const response = await API.post('/api/Schedule', scheduleData)
        return response.data
    },

    updateSchedule: async (id, scheduleData) => {
        const response = await API.put(`/api/Schedule/${id}`, scheduleData)
        return response.data
    },

    deleteSchedule: async (id) => {
        const response = await API.delete(`/api/Schedule/${id}`)
        return response.data
    }
}

export default scheduleService
