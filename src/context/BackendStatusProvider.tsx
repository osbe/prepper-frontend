import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import client, { isBackendUnreachable } from '../api/client'
import { BackendStatusContext } from './BackendStatusContext'

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const queryClient = useQueryClient()

  useQuery({
    queryKey: ['__health__'],
    queryFn: () => client.get('/products', { params: { __nc: '1' } }),
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
      } else if (state.status === 'success' && event.query.queryKey[0] === '__health__') {
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
