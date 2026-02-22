import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 404) {
        return Promise.reject(new Error('Not found'))
      }
      if (status && status >= 400 && status < 500) {
        return Promise.reject(new Error('Client error — please check your input'))
      }
    }
    return Promise.reject(error)
  },
)

export default client
