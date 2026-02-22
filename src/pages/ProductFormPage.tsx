import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import ProductForm from '../components/products/ProductForm'
import type { ProductPayload } from '../types'

interface Props {
  forceId?: number
}

export default function ProductFormPage({ forceId }: Props) {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const resolvedId = forceId ?? (id ? Number(id) : undefined)
  const isEdit = resolvedId !== undefined
  const productId = isEdit ? resolvedId : 0
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { data: existing, isLoading } = useProduct(productId)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(productId)

  const handleSubmit = async (payload: ProductPayload) => {
    setError(null)
    try {
      if (isEdit) {
        await updateProduct.mutateAsync(payload)
        navigate(payload.category === 'WATER' ? '/water' : `/food/${productId}`)
      } else {
        const created = await createProduct.mutateAsync(payload)
        navigate(created.category === 'WATER' ? '/water' : `/food/${created.id}`)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.something_went_wrong'))
    }
  }

  if (isEdit && isLoading) return <p className="text-gray-400 text-sm">{t('common.loading')}</p>

  const isMutating = createProduct.isPending || updateProduct.isPending

  const backLink = isEdit
    ? (existing?.category === 'WATER' ? '/water' : `/food/${productId}`)
    : '/food'

  return (
    <div className="max-w-lg">
      {existing?.category !== 'WATER' && (
        <div className="mb-6">
          <Link
            to={backLink}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {isEdit ? t('product_form.back_to_product') : t('product_form.back_to_products')}
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? t('product_form.edit_title') : t('product_form.add_title')}
      </h1>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <ProductForm
          initial={isEdit ? existing : undefined}
          onSubmit={handleSubmit}
          isLoading={isMutating}
          error={error}
        />
      </div>
    </div>
  )
}
