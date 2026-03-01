import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product } from '../../types'
import ProgressBar from '../ui/ProgressBar'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { t } = useTranslation()
  const { id, name, category, unit, currentStock, targetQuantity } = product
  const unitLabel = t(`units.${unit}`)
  const atTarget = currentStock >= targetQuantity

  return (
    <Link
      to={category === 'WATER' ? '/water' : `/food/${id}`}
      className="block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors hover:border-gray-300 dark:hover:border-gray-600"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t(`categories.${category}`)}</span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${atTarget ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}
        >
          {atTarget ? t('products.ok_badge') : t('products.low_badge')}
        </span>
      </div>
      <ProgressBar current={currentStock} target={targetQuantity} />
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {currentStock} / {targetQuantity} {unitLabel}
      </p>
    </Link>
  )
}
