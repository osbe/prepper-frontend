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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${value === undefined
            ? 'bg-green-700 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
      >
        {t('category_filter.all')}
      </button>
      {FOOD_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === value ? undefined : cat)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${value === cat
              ? 'bg-green-700 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          <span aria-hidden="true">{CATEGORY_ICONS[cat as FoodCategory]}</span>
          {t(`categories.${cat}`)}
        </button>
      ))}
    </div>
  )
}
