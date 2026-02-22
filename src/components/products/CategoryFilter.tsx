import type { Category } from '../../types'
import { CATEGORIES, CATEGORY_LABELS } from '../../types'

interface Props {
  value: Category | undefined
  onChange: (cat: Category | undefined) => void
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          value === undefined
            ? 'bg-green-700 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === value ? undefined : cat)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            value === cat
              ? 'bg-green-700 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  )
}
