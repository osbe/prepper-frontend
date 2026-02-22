import axios from 'axios'
import i18n from '../i18n'

const client = axios.create({ baseURL: '/api' })

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 404) {
        return Promise.reject(new Error(i18n.t('errors.not_found')))
      }
      if (status && status >= 400 && status < 500) {
        return Promise.reject(new Error(i18n.t('errors.client_error')))
      }
    }
    return Promise.reject(error)
  },
)

export default client
