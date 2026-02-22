import { useTranslation } from 'react-i18next'
import type { Category } from '../../types'
import { FOOD_CATEGORIES } from '../../types'

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
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${value === cat
              ? 'bg-green-700 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          {t(`categories.${cat}`)}
        </button>
      ))}
    </div>
  )
}
