import { useTranslation } from 'react-i18next'
import { useExpiredStock, useExpiringStock, useLowStock } from '../hooks/useStock'
import { useProducts } from '../hooks/useProducts'
import type { StockEntry, Product } from '../types'
import { Link } from 'react-router-dom'
import { useFormatDate } from '../i18n/useFormatDate'
import WaterWidget from '../components/dashboard/WaterWidget'
import PreparednessRating from '../components/dashboard/PreparednessRating'
import ProgressBar from '../components/ui/ProgressBar'

function StockAlertRow({
  entry,
  products,
  color,
}: {
  entry: StockEntry
  products: Product[]
  color: 'red' | 'yellow'
}) {
  const { t } = useTranslation()
  const formatDate = useFormatDate()
  const product = products.find((p) => p.id === entry.productId)
  const unit = product ? t(`units.${product.unit}`) : ''
  const borderColor = color === 'red' ? 'border-red-500' : 'border-yellow-500'
  const actionColor = color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
  const href = product?.category === 'WATER' ? '/water' : `/food/${entry.productId}`

  return (
    <Link
      to={href}
      className={`block border-l-4 ${borderColor} bg-white dark:bg-gray-800 hover:bg-gray-50 rounded-r-lg px-4 py-3 transition-colors`}
    >
      <p className="font-medium text-gray-900 dark:text-white">
        {product?.name ?? t('dashboard.product_fallback', { id: entry.productId })}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {entry.quantity} {unit}{entry.expiryDate && ` · ${t('dashboard.expires', { date: formatDate(entry.expiryDate) })}`}
        {entry.location && ` · ${entry.location}`}
      </p>
      {entry.expiryStatus && product && (
        <p className={`text-xs mt-1 ${actionColor}`}>
          {t(`action.${product.category}.${entry.expiryStatus}`)}
        </p>
      )}
    </Link>
  )
}

function LowStockRow({ product }: { product: Product }) {
  const { t } = useTranslation()
  const unit = t(`units.${product.unit}`)
  return (
    <Link
      to={product.category === 'WATER' ? '/water' : `/food/${product.id}`}
      className="block border-l-4 border-blue-500 bg-white dark:bg-gray-800 hover:bg-gray-50 rounded-r-lg px-4 py-3 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {product.currentStock} / {product.targetQuantity} {unit}
        </p>
      </div>
      <ProgressBar current={product.currentStock} target={product.targetQuantity} />
    </Link>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: expired = [], isLoading: l1 } = useExpiredStock()
  const { data: expiring = [], isLoading: l2 } = useExpiringStock()
  const { data: low = [], isLoading: l3 } = useLowStock()
  const { data: products = [], isLoading: l4 } = useProducts()

  const isLoading = l1 || l2 || l3 || l4
  const isEmpty = products.length === 0
  const allGood = !isEmpty && expired.length === 0 && expiring.length === 0 && low.length === 0

  if (isLoading) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm">{t('common.loading')}</p>
  }

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <WaterWidget />

        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">{t('dashboard.empty')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.empty_desc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PreparednessRating products={products} expired={expired} />

      <WaterWidget />

      {allGood && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-green-400">{t('dashboard.all_good')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.all_good_desc')}</p>
        </div>
      )}

      {expired.length > 0 && (
        <section>
          <h2 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {t('dashboard.expired_heading', { count: expired.length })}
          </h2>
          <div className="space-y-2">
            {expired.map((e) => (
              <StockAlertRow key={e.id} entry={e} products={products} color="red" />
            ))}
          </div>
        </section>
      )}

      {expiring.length > 0 && (
        <section>
          <h2 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {t('dashboard.expiring_heading', { count: expiring.length })}
          </h2>
          <div className="space-y-2">
            {expiring.map((e) => (
              <StockAlertRow key={e.id} entry={e} products={products} color="yellow" />
            ))}
          </div>
        </section>
      )}

      {low.length > 0 && (
        <section>
          <h2 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
            {t('dashboard.low_stock_heading', { count: low.length })}
          </h2>
          <div className="space-y-2">
            {low.map((p) => (
              <LowStockRow key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
