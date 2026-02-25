import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProducts, useUpdateProduct } from '../hooks/useProducts'
import WaterForm from '../components/products/WaterForm'
import type { ProductPayload } from '../types'

export default function WaterEditPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: products = [], isLoading: pLoading, error: pError } = useProducts()
    const [error, setError] = useState<string | null>(null)

    const waterProduct = products.find((p) => p.category === 'WATER')
    const updateProduct = useUpdateProduct(waterProduct?.id ?? 0)

    const handleSubmit = async (payload: ProductPayload) => {
        setError(null)
        try {
            await updateProduct.mutateAsync(payload)
            navigate('/water')
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t('errors.something_went_wrong'))
        }
    }

    if (pLoading) return <p className="text-gray-400 text-sm p-4">{t('common.loading')}</p>
    if (pError || !waterProduct) {
        return (
            <div className="text-center py-16">
                <p className="text-red-400">{t('products.not_found')}</p>
                <Link to="/" className="text-green-400 hover:underline text-sm mt-2 block">
                    {t('not_found.cta')}
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-lg">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">
                {t('product_form.edit_water_title')}
            </h1>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
                <WaterForm
                    initial={waterProduct}
                    onSubmit={handleSubmit}
                    isLoading={updateProduct.isPending}
                    error={error}
                />
            </div>
        </div>
    )
}
