import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import client from '../api/client'
import { BackendStatusContext } from './BackendStatusContext'

function isBackendUnreachable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (!error.response) return true
  return error.response.status >= 500
}

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const queryClient = useQueryClient()

  useQuery({
    queryKey: ['__health__'],
    queryFn: () => client.get('/products'),
    refetchInterval: 15_000,
    retry: 0,
    staleTime: 0,
  })

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return
      const { state } = event.query
      if (state.status === 'error' && isBackendUnreachable(state.error)) {
        setIsOffline(true)
      } else if (state.status === 'success') {
        setIsOffline(false)
      }
    })
    return unsubscribe
  }, [queryClient])

  return (
    <BackendStatusContext.Provider value={isOffline}>
      {children}
    </BackendStatusContext.Provider>
  )
}
