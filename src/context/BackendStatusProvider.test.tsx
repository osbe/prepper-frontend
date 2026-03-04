import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { BackendStatusProvider } from './BackendStatusProvider'
import { useBackendStatus } from './useBackendStatus'

const mocks = vi.hoisted(() => ({
  clientGet: vi.fn(),
}))

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>()
  return { ...actual, default: { get: mocks.clientGet } }
})

function networkError() {
  // An Axios error with no response object — simulates ECONNREFUSED
  return new axios.AxiosError('Network Error')
}

function Consumer() {
  const isOffline = useBackendStatus()
  return <div data-testid="status">{isOffline ? 'offline' : 'online'}</div>
}

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <BackendStatusProvider>
        <Consumer />
      </BackendStatusProvider>
    </QueryClientProvider>,
  )
  return qc
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BackendStatusProvider', () => {
  it('sets isOffline=true when a query fails with a network error', async () => {
    mocks.clientGet.mockRejectedValue(networkError())
    setup()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('offline'))
  })

  it('does NOT reset isOffline when a non-health query succeeds', async () => {
    // The health check fails → isOffline becomes true
    mocks.clientGet.mockRejectedValue(networkError())
    const qc = setup()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('offline'))

    // Simulate products being served from Workbox cache (non-health query succeeds)
    await act(async () => {
      await qc.fetchQuery({
        queryKey: ['products', null],
        queryFn: () => Promise.resolve([]),
        retry: false,
      })
    })

    // Only the health check can reset isOffline — non-health successes must be ignored
    expect(screen.getByTestId('status')).toHaveTextContent('offline')
  })

  it('resets isOffline to false when the health check query succeeds', async () => {
    mocks.clientGet
      .mockRejectedValueOnce(networkError()) // initial poll → offline
      .mockResolvedValue({ data: [] })        // next poll → online

    const qc = setup()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('offline'))

    // Simulate the health poll firing again after backend recovers
    await act(async () => {
      await qc.refetchQueries({ queryKey: ['__health__'] })
    })

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('online'))
  })
})
