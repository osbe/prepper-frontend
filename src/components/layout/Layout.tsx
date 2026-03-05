import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Navbar from './Navbar'
import BottomTabBar from './BottomTabBar'
import { makeProductsQueryFn, makeProductStockQueryFn } from '../../hooks/useProducts'
import { useSync } from '../../context/useSync'
import { saveQueryCache } from '../../offline/queryPersister'
import type { Product } from '../../types'

export default function Layout() {
  const qc = useQueryClient()
  const { setPrefetching } = useSync()

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
