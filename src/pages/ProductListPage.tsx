import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../types'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/products/ProductCard'
import CategoryFilter from '../components/products/CategoryFilter'

export default function ProductListPage() {
  const [category, setCategory] = useState<Category | undefined>()
  const { data: products = [], isLoading, error } = useProducts(category)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link
          to="/products/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add product
        </Link>
      </div>

      <div className="mb-6">
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {error && (
        <p className="text-red-400 text-sm">Failed to load products.</p>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products yet.</p>
          <Link to="/products/new" className="text-green-400 hover:underline text-sm mt-1 block">
            Add your first product →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
