import { useTranslation } from 'react-i18next'
import type { Category } from '../../types'
import { FOOD_CATEGORIES } from '../../types'

type FoodCategory = 'PRESERVED_FOOD' | 'DRY_GOODS' | 'FREEZE_DRIED'

const CATEGORY_ICONS: Record<FoodCategory, string> = {
  PRESERVED_FOOD: '🥫',
  DRY_GOODS: '🌾',
  FREEZE_DRIED: '❄️',
}

interface Props {
  value: Category | undefined
  onChange: (cat: Category | undefined) => void
}

export default function CategoryFilter({ value, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2.5">
      <button
        onClick={() => onChange(undefined)}
        aria-label={t('category_filter.all')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${value === undefined
            ? 'bg-green-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
      >
        {t('category_filter.all')}
      </button>
      {FOOD_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === value ? undefined : cat)}
          aria-label={t(`categories.${cat}`)}
          className={`w-8 h-8 rounded-full text-base flex items-center justify-center transition-colors ${value === cat
              ? 'bg-green-700'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          {CATEGORY_ICONS[cat as FoodCategory]}
        </button>
      ))}
    </div>
  )
}
