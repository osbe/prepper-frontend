import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProducts, useCreateProduct } from '../../hooks/useProducts'

export default function WaterWidget() {
    const { t } = useTranslation()
    const { data: products = [], isLoading } = useProducts()
    const createProduct = useCreateProduct()

    const [isSettingUp, setIsSettingUp] = useState(false)
    const [targetLiters, setTargetLiters] = useState('100')

    // If the products are still loading, don't show the setup UI immediately, wait for the actual data.
    if (isLoading) {
        return (
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-6">
                <p className="text-gray-400 text-sm">{t('common.loading')}</p>
            </div>
        )
    }

    const waterProduct = products.find(p => p.category === 'WATER')

    const handleSetup = async () => {
        setIsSettingUp(true)
        try {
            await createProduct.mutateAsync({
                name: t('water_widget.default_name'),
                category: 'WATER',
                unit: 'LITERS',
                targetQuantity: parseFloat(targetLiters) || 100,
            })
        } finally {
            setIsSettingUp(false)
        }
    }

    if (!waterProduct) {
        return (
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-blue-300 mb-2">{t('water_widget.title')}</h2>
                <p className="text-gray-400 text-sm mb-4">{t('water_widget.setup_prompt')}</p>

                <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-sm">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-1">{t('water_widget.target_liters')}</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full bg-gray-800 border border-blue-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            value={targetLiters}
                            onChange={(e) => setTargetLiters(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSetup}
                        disabled={isSettingUp}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isSettingUp ? t('common.saving') : t('water_widget.setup_button')}
                    </button>
                </div>
            </div>
        )
    }

    // The user has set up the water product.
    // Dashboard only shows notifications now.
    return null
}
