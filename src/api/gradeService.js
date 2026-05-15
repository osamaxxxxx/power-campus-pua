import API from './axios'

const gradeService = {
    getStudentGrades: async (studentId) => {
        const response = await API.get(`/api/Grades/student/${studentId}`)
        return response.data
    },

    getCourseGrades: async (courseId) => {
        const response = await API.get(`/api/Grades/course/${courseId}`)
        return response.data
    },

    submitGrade: async (gradeData) => {
        const response = await API.post('/api/Grades', gradeData)
        return response.data
    },

    updateGrade: async (id, gradeData) => {
        const response = await API.put(`/api/Grades/${id}`, gradeData)
        return response.data
    }
}

export default gradeService
