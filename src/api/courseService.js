import API from './axios'

const courseService = {
    getAllCourses: async () => {
        try {
            const response = await API.get('/api/Courses')
            return response.data
        } catch (error) {
            console.error('Error fetching courses:', error)
            throw error
        }
    },

    getAvailableCourses: async () => {
        try {
            const response = await API.get('/api/Courses/available')
            return response.data
        } catch (error) {
            console.error('Error fetching available courses:', error)
            throw error
        }
    },

    enrollInCourse: async (courseId) => {
        try {
            const response = await API.post(`/api/Courses/${courseId}/enroll`)
            return response.data
        } catch (error) {
            console.error('Error enrolling in course:', error)
            throw error
        }
    },

    createCourse: async (courseData) => {
        try {
            const response = await API.post('/api/Courses', courseData)
            return response.data
        } catch (error) {
            console.error('Error creating course:', error)
            throw error
        }
    },

    deleteCourse: async (courseId) => {
        try {
            const response = await API.delete(`/api/Courses/${courseId}`)
            return response.data
        } catch (error) {
            console.error('Error deleting course:', error)
            throw error
        }
    }
}

export default courseService
