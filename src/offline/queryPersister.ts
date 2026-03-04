import { dehydrate, hydrate, type DehydratedState } from '@tanstack/react-query'
import { queryClient } from '../queryClient'
import { db } from './db'

const KEY = 'tq'
const MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function saveQueryCache(): Promise<void> {
  const state = dehydrate(queryClient, {
    shouldDehydrateQuery: (q) => q.queryKey[0] !== '__health__' && q.state.status === 'success',
  })
  await db.queryCache.put({ id: KEY, state, savedAt: Date.now() })
}

export async function restoreQueryCache(): Promise<void> {
  const snap = await db.queryCache.get(KEY)
  if (!snap || Date.now() - snap.savedAt > MAX_AGE) {
    if (snap) await db.queryCache.delete(KEY)
    return
  }
  hydrate(queryClient, snap.state as DehydratedState)
}
