import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProducts, useCreateProduct, useAddStockEntry } from '../../hooks/useProducts'
import Modal from '../ui/Modal'
import StockEntryForm from '../stock/StockEntryForm'
import { Link } from 'react-router-dom'

export default function WaterWidget() {
    const { t } = useTranslation()
    const { data: products = [], isLoading } = useProducts()
    const createProduct = useCreateProduct()

    const [isSettingUp, setIsSettingUp] = useState(false)
    const [targetLiters, setTargetLiters] = useState('100')
    const [showAddStock, setShowAddStock] = useState(false)

    // If the products are still loading, don't show the setup UI immediately, wait for the actual data.
    if (isLoading) {
        return (
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-6">
                <p className="text-gray-400 text-sm">{t('common.loading')}</p>
            </div>
        )
    }

    const waterProduct = products.find(p => p.category === 'WATER')
    const addStock = useAddStockEntry(waterProduct?.id ?? 0)

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

    const handleAddStock = async (payload: Parameters<typeof addStock.mutateAsync>[0]) => {
        try {
            await addStock.mutateAsync(payload)
            setShowAddStock(false)
        } catch (e) {
            console.error(e)
        }
    }

    if (!waterProduct) {
        return (
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-blue-300 mb-2">{t('water_widget.title')}</h2>
                <p className="text-gray-400 text-sm mb-4">{t('water_widget.setup_prompt')}</p>

                <div className="flex items-end gap-3 max-w-sm">
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
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isSettingUp ? t('common.saving') : t('water_widget.setup_button')}
                    </button>
                </div>
            </div>
        )
    }

    const percentage = Math.min((waterProduct.currentStock / waterProduct.targetQuantity) * 100, 100)
    const isOk = waterProduct.currentStock >= waterProduct.targetQuantity

    return (
        <>
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                            💧 {t('water_widget.title')}
                        </h2>
                        <Link
                            to={`/products/${waterProduct.id}`}
                            className="text-gray-400 hover:text-blue-400 text-sm mt-1 inline-block transition-colors"
                        >
                            {t('water_widget.manage_link')} →
                        </Link>
                    </div>
                    <button
                        onClick={() => setShowAddStock(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {t('water_widget.add_stock')}
                    </button>
                </div>

                <div className="mt-5">
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300 font-medium">
                            {waterProduct.currentStock} {t('units.LITERS')} {t('water_widget.stored')}
                        </span>
                        <span className="text-gray-500">
                            {t('water_widget.target')}: {waterProduct.targetQuantity} {t('units.LITERS')}
                        </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
                        <div
                            className={`h-3 rounded-full transition-all ${isOk ? 'bg-blue-500' : 'bg-blue-400/60'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {showAddStock && (
                <Modal title={t('water_widget.add_stock')} onClose={() => setShowAddStock(false)}>
                    <StockEntryForm
                        unit="LITERS"
                        onSubmit={handleAddStock}
                        isLoading={addStock.isPending}
                        error={null}
                        hideExpiryDate
                    />
                </Modal>
            )}
        </>
    )
}
