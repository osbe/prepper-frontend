import { useTranslation } from 'react-i18next'
import type { Product, StockEntry } from '../../types'
import { FOOD_CATEGORIES } from '../../types'

interface Props {
  products: Product[]
  expired: StockEntry[]
}

const hintKeys = [
  'preparedness.hint_add_food',
  'preparedness.hint_add_water',
  'preparedness.hint_food_half',
  'preparedness.hint_water_half',
  'preparedness.hint_full_both',
] as const

export default function PreparednessRating({ products, expired }: Props) {
  const { t } = useTranslation()

  const expiredByProduct = new Map<number, number>()
  for (const entry of expired) {
    expiredByProduct.set(entry.productId, (expiredByProduct.get(entry.productId) ?? 0) + entry.quantity)
  }

  const nonExpiredStock = (p: Product) =>
    Math.max(0, p.currentStock - (expiredByProduct.get(p.id) ?? 0))

  const foodProducts = products.filter((p) => FOOD_CATEGORIES.includes(p.category))
  const waterProducts = products.filter((p) => p.category === 'WATER')

  if (foodProducts.length === 0 && waterProducts.length === 0) return null

  const totalFoodTarget = foodProducts.reduce((sum, p) => sum + p.targetQuantity, 0)
  const totalWaterTarget = waterProducts.reduce((sum, p) => sum + p.targetQuantity, 0)
  const totalNonExpiredFood = foodProducts.reduce((sum, p) => sum + nonExpiredStock(p), 0)
  const totalNonExpiredWater = waterProducts.reduce((sum, p) => sum + nonExpiredStock(p), 0)

  const starConditions = [
    foodProducts.some((p) => nonExpiredStock(p) > 0),
    waterProducts.some((p) => nonExpiredStock(p) > 0),
    foodProducts.length > 0 && totalFoodTarget > 0 && totalNonExpiredFood >= totalFoodTarget * 0.5,
    waterProducts.length > 0 && totalWaterTarget > 0 && totalNonExpiredWater >= totalWaterTarget * 0.5,
    foodProducts.length > 0 && foodProducts.every((p) => nonExpiredStock(p) >= p.targetQuantity) &&
      waterProducts.length > 0 && totalWaterTarget > 0 && totalNonExpiredWater >= totalWaterTarget,
  ]

  const stars = starConditions.filter(Boolean).length
  const firstUnearned = starConditions.findIndex((c) => !c)
  const hint =
    firstUnearned === -1
      ? t('preparedness.perfect')
      : stars === 0
        ? t('preparedness.hint_add_food_or_water')
        : firstUnearned === 2 && !starConditions[3]
          ? t('preparedness.hint_food_or_water_half')
          : t(hintKeys[firstUnearned])

  return (
    <section>
      <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
        {t('preparedness.title')}
      </h2>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4">
        <div className="flex mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`flex-1 text-center text-5xl leading-none ${i < stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
              {i < stars ? '★' : '☆'}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{hint}</p>
      </div>
    </section>
  )
}
