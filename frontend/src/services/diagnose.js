import api from './api'

export const diagnoseApi = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await api.post('/api/diagnose/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  submitDiagnosis: async (formData) => {
    const response = await api.post('/api/diagnose', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  diagnose: async (data) => {
    const response = await api.post('/api/diagnose', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  getDiagnosisById: async (id) => {
    const response = await api.get(`/api/history/${id}`)
    return response
  },

  getResult: async (id) => {
    const response = await api.get(`/api/history/${id}`)
    return response
  },

  getHistory: async (params) => {
    const response = await api.get('/api/history', { params })
    return response
  },

  deleteHistory: async (id) => {
    const response = await api.delete(`/api/history/${id}`)
    return response
  },
}

export default diagnoseApi
