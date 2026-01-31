import API from './axios'

const userService = {
    getAllUsers: async () => {
        const response = await API.get('/api/Users')
        return response.data
    },

    getUserById: async (id) => {
        const response = await API.get(`/api/Users/${id}`)
        return response.data
    },

    createUser: async (userData) => {
        const response = await API.post('/api/Users', userData)
        return response.data
    },

    updateUser: async (id, userData) => {
        const response = await API.put(`/api/Users/${id}`, userData)
        return response.data
    },

    deleteUser: async (id) => {
        const response = await API.delete(`/api/Users/${id}`)
        return response.data
    }
}

export default userService
