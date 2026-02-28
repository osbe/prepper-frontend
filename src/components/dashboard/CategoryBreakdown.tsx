import { useTranslation } from 'react-i18next'
import type { Product } from '../../types'
import ProgressBar from '../ui/ProgressBar'

interface Props {
  products: Product[]
}

function GroupRow({ label, products }: { label: string; products: Product[] }) {
  const { t } = useTranslation()
  const atTarget = products.filter((p) => p.currentStock >= p.targetQuantity).length
  const total = products.length

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-gray-400">
          {t('dashboard.category_at_target', { count: atTarget, total })}
        </span>
      </div>
      <ProgressBar current={atTarget} target={total} />
    </div>
  )
}

export default function CategoryBreakdown({ products }: Props) {
  const { t } = useTranslation()

  const water = products.filter((p) => p.category === 'WATER')
  const food = products.filter((p) => p.category !== 'WATER')

  return (
    <section>
      <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
        {t('dashboard.category_breakdown')}
      </h2>
      <div className="space-y-2">
        {water.length > 0 && <GroupRow label={t('nav.water')} products={water} />}
        {food.length > 0 && <GroupRow label={t('nav.products')} products={food} />}
      </div>
    </section>
  )
}
