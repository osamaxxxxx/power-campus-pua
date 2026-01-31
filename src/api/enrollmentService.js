import API from './axios'

const enrollmentService = {
    getStudentCourses: async (studentId) => {
        const response = await API.get(`/api/Enrollments/students/${studentId}/courses`)
        return response.data
    },

    getCourseEnrollments: async (courseId) => {
        const response = await API.get(`/api/Enrollments/course/${courseId}`)
        return response.data
    },

    enrollStudent: async (enrollmentData) => {
        const response = await API.post('/api/Enrollments', enrollmentData)
        return response.data
    },

    dropCourse: async (id) => {
        const response = await API.delete(`/api/Enrollments/${id}`)
        return response.data
    }
}

export default enrollmentService
