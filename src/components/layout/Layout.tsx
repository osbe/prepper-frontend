import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Navbar from './Navbar'
import BottomTabBar from './BottomTabBar'
import { getProducts } from '../../api/products'
import { makeProductStockQueryFn } from '../../hooks/useProducts'
import type { Product } from '../../types'

export default function Layout() {
  const qc = useQueryClient()

  useEffect(() => {
    qc.prefetchQuery({
      queryKey: ['products', null],
      queryFn: () => getProducts(),
    }).then(() => {
      const products = qc.getQueryData<Product[]>(['products', null]) ?? []
      for (const p of products) {
        qc.prefetchQuery({
          queryKey: ['products', p.id, 'stock'],
          queryFn: makeProductStockQueryFn(p.id, qc),
        })
      }
    })
  }, [qc])

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
