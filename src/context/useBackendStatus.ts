import { useContext } from 'react'
import { BackendStatusContext } from './BackendStatusContext'

export function useBackendStatus(): boolean {
  return useContext(BackendStatusContext)
}
