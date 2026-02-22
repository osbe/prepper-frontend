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
      to={`/products/${id}`}
      className="block bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-4 transition-colors hover:border-gray-600"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <span className="text-xs text-gray-400">{t(`categories.${category}`)}</span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            atTarget ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {atTarget ? t('products.ok_badge') : t('products.low_badge')}
        </span>
      </div>
      <ProgressBar current={currentStock} target={targetQuantity} />
      <p className="mt-2 text-sm text-gray-400">
        {currentStock} / {targetQuantity} {unitLabel}
      </p>
    </Link>
  )
}
