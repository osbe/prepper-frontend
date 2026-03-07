import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'
import BottomTabBar from './BottomTabBar'
import Toast from '../ui/Toast'
import { makeProductsQueryFn, makeProductStockQueryFn } from '../../hooks/useProducts'
import { useSync } from '../../context/useSync'
import { saveQueryCache } from '../../offline/queryPersister'
import type { Product } from '../../types'

export default function Layout() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { setPrefetching, conflicts, clearConflicts } = useSync()

  useEffect(() => {
    setPrefetching(true)
    qc.prefetchQuery({
      queryKey: ['products', null],
      queryFn: makeProductsQueryFn(undefined, qc),
    }).then(() => {
      const products = qc.getQueryData<Product[]>(['products', null]) ?? []
      return Promise.all(
        products.map((p) =>
          qc.prefetchQuery({
            queryKey: ['products', p.id, 'stock'],
            queryFn: makeProductStockQueryFn(p.id, qc),
          })
        )
      )
    }).finally(() => {
      setPrefetching(false)
      saveQueryCache()
    })
  }, [qc, setPrefetching])

  // Persist the query cache whenever the app is backgrounded (e.g. user switches apps
  // on mobile). TanStack Query background refetches keep the in-memory cache fresh but
  // do not trigger saveQueryCache(), so without this the Dexie snapshot can be stale.
  useEffect(() => {
    const save = () => {
      if (document.visibilityState === 'hidden') void saveQueryCache()
    }
    document.addEventListener('visibilitychange', save)
    return () => document.removeEventListener('visibilitychange', save)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>
      <BottomTabBar />
      {conflicts.length > 0 && (
        <Toast
          message={t('sync.conflict', { count: conflicts.length })}
          actionLabel={t('common.confirm')}
          onAction={clearConflicts}
          onDismiss={clearConflicts}
          duration={8000}
        />
      )}
    </div>
  )
}
