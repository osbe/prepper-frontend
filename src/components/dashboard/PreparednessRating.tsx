import { useTranslation } from 'react-i18next'
import type { Product, StockEntry } from '../../types'
import { FOOD_CATEGORIES } from '../../types'

interface Props {
  products: Product[]
  expired: StockEntry[]
}

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

  const hasSomeFood = foodProducts.some((p) => nonExpiredStock(p) > 0)
  const hasSomeWater = waterProducts.some((p) => nonExpiredStock(p) > 0)
  const allFoodTargetsMet =
    foodProducts.length > 0 && foodProducts.every((p) => nonExpiredStock(p) >= p.targetQuantity)
  const totalWaterTarget = waterProducts.reduce((sum, p) => sum + p.targetQuantity, 0)
  const totalNonExpiredWater = waterProducts.reduce((sum, p) => sum + nonExpiredStock(p), 0)
  const waterHalfMet =
    waterProducts.length > 0 && totalWaterTarget > 0 && totalNonExpiredWater >= totalWaterTarget * 0.5
  const waterFullyMet =
    waterProducts.length > 0 && totalWaterTarget > 0 && totalNonExpiredWater >= totalWaterTarget

  const starConditions = [hasSomeFood, hasSomeWater, allFoodTargetsMet, waterHalfMet, waterFullyMet]
  const firstUnearned = starConditions.findIndex((c) => !c)
  const stars = firstUnearned === -1 ? 5 : firstUnearned

  const hint =
    !hasSomeFood
      ? t('preparedness.hint_add_food')
      : !hasSomeWater
        ? t('preparedness.hint_add_water')
        : !allFoodTargetsMet
          ? t('preparedness.hint_food_targets')
          : !waterHalfMet
            ? t('preparedness.hint_water_half')
            : !waterFullyMet
              ? t('preparedness.hint_water_full')
              : t('preparedness.perfect')

  return (
    <section>
      <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
        {t('preparedness.title')}
      </h2>
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-4">
      <div className="flex mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`flex-1 text-center text-5xl leading-none ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}>
            {i < stars ? '★' : '☆'}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-400 text-center">{hint}</p>
      </div>
    </section>
  )
}
