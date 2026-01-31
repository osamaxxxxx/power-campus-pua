import API from './axios'

const lectureService = {
    getCourseLectures: async (courseId) => {
        const response = await API.get(`/api/Lectures/course/${courseId}`)
        return response.data
    },

    getLecture: async (id) => {
        const response = await API.get(`/api/Lectures/${id}`)
        return response.data
    },

    createLecture: async (lectureData) => {
        const response = await API.post('/api/Lectures', lectureData)
        return response.data
    },

    updateLecture: async (id, lectureData) => {
        const response = await API.put(`/api/Lectures/${id}`, lectureData)
        return response.data
    },

    deleteLecture: async (id) => {
        const response = await API.delete(`/api/Lectures/${id}`)
        return response.data
    }
}

export default lectureService
