import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Category, ProductPayload } from '../types'
import { FOOD_CATEGORIES } from '../types'
import { useProducts, useCreateProduct } from '../hooks/useProducts'
import ProductCard from '../components/products/ProductCard'
import CategoryFilter from '../components/products/CategoryFilter'
import BottomSheet from '../components/ui/BottomSheet'
import FoodForm from '../components/products/FoodForm'

export default function FoodListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | undefined>()
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const { data: allProducts = [], isLoading, error } = useProducts(category)
  const createProduct = useCreateProduct()

  const products = allProducts.filter(p => FOOD_CATEGORIES.includes(p.category))

  const handleAddProduct = async (payload: ProductPayload) => {
    setAddError(null)
    try {
      const created = await createProduct.mutateAsync(payload)
      navigate(`/food/${created.id}`)
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : t('errors.something_went_wrong'))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t('products.page_title')}</h1>
      </div>

      <div className="mb-6">
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {isLoading && <p className="text-gray-400 text-sm">{t('common.loading')}</p>}

      {error && (
        <p className="text-red-400 text-sm">{t('products.loading_error')}</p>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">{t('products.empty')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* FAB */}
      {!showAddProduct && (
        <button
          onClick={() => setShowAddProduct(true)}
          aria-label={t('products.add_button')}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-3xl shadow-lg transition-colors flex items-center justify-center"
        >
          +
        </button>
      )}

      {showAddProduct && (
        <BottomSheet title={t('product_form.add_title')} onClose={() => setShowAddProduct(false)}>
          <FoodForm
            onSubmit={handleAddProduct}
            isLoading={createProduct.isPending}
            error={addError}
          />
        </BottomSheet>
      )}
    </div>
  )
}
