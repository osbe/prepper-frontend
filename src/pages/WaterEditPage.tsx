import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductFormPage from './ProductFormPage'

export default function WaterEditPage() {
    const { t } = useTranslation()
    const { data: products = [], isLoading, error } = useProducts()

    if (isLoading) return <p className="text-gray-400 text-sm p-4">{t('common.loading')}</p>
    if (error) return <p className="text-red-400 text-sm p-4">{t('errors.something_went_wrong')}</p>

    const waterProduct = products.find((p) => p.category === 'WATER')

    if (!waterProduct) {
        return (
            <div className="text-center py-16">
                <p className="text-red-400">{t('products.not_found')}</p>
                <Link to="/" className="text-green-400 hover:underline text-sm mt-2 block">
                    {t('not_found.cta')}
                </Link>
            </div>
        )
    }

    return <ProductFormPage forceId={waterProduct.id} />
}
