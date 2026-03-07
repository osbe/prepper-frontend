import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import client, { isBackendUnreachable } from '../api/client'
import { BackendStatusContext } from './BackendStatusContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  // Tracks whether the backend is unreachable based on query/health-check failures.
  // The context value also incorporates navigator.onLine so that mutations can skip
  // the network attempt immediately when the device has no connectivity at all.
  const [isBackendQueryOffline, setIsBackendQueryOffline] = useState(false)
  const isOnline = useOnlineStatus()
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
        setIsBackendQueryOffline(true)
      } else if (state.status === 'success' && event.query.queryKey[0] === '__health__') {
        setIsBackendQueryOffline(false)
      }
    })
    return unsubscribe
  }, [queryClient])

  return (
    <BackendStatusContext.Provider value={isBackendQueryOffline || !isOnline}>
      {children}
    </BackendStatusContext.Provider>
  )
}
