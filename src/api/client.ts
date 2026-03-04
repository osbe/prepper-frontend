import axios from 'axios'
import i18n from '../i18n'

export function isBackendUnreachable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (!error.response) return true
  const status = error.response.status
  return status === 502 || status === 503 || status === 504
}

export class NotFoundError extends Error {
  constructor() {
    super(i18n.t('errors.not_found'))
    this.name = 'NotFoundError'
  }
}

const base = document.querySelector('base')?.getAttribute('href') ?? '/'
const client = axios.create({ baseURL: `${base}api` })

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 404) {
        return Promise.reject(new NotFoundError())
      }
      if (status && status >= 400 && status < 500) {
        return Promise.reject(new Error(i18n.t('errors.client_error')))
      }
    }
    return Promise.reject(error)
  },
)

export default client
