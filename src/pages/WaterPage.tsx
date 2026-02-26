import { useTranslation } from 'react-i18next'
import { useProducts } from '../hooks/useProducts'
import WaterDetailPage from './WaterDetailPage'
import WaterWidget from '../components/dashboard/WaterWidget'

export default function WaterPage() {
    const { t } = useTranslation()
    const { data: products = [], isLoading, error } = useProducts()

    if (isLoading) return <p className="text-gray-400 text-sm p-4">{t('common.loading')}</p>
    if (error) return <p className="text-red-400 text-sm p-4">{t('errors.something_went_wrong')}</p>

    const waterProduct = products.find((p) => p.category === 'WATER')

    if (!waterProduct) {
        return <WaterWidget />
    }

    return <WaterDetailPage forceId={waterProduct.id} />
}
