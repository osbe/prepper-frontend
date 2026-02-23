import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category, Product, ProductPayload, Unit } from '../../types'
import { FOOD_CATEGORIES, UNITS } from '../../types'

interface Props {
  initial?: Product
  onSubmit: (payload: ProductPayload) => void
  isLoading?: boolean
  error?: string | null
}

export default function FoodForm({ initial, onSubmit, isLoading, error }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'PRESERVED_FOOD')
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? 'PIECES')
  const [targetQuantity, setTargetQuantity] = useState(
    initial?.targetQuantity?.toString() ?? '',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      category,
      unit,
      targetQuantity: parseFloat(targetQuantity),
      notes: notes.trim() || null,
    })
  }

  const inputClass =
    'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('product_form.name_label')}</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('product_form.name_placeholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('product_form.category_label')}</label>
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`categories.${c}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('product_form.unit_label')}</label>
        <select
          className={inputClass}
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {t(`units.${u}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('product_form.target_qty_label')}</label>
        <input
          className={inputClass}
          type="number"
          min="0"
          step="any"
          value={targetQuantity}
          onChange={(e) => setTargetQuantity(e.target.value)}
          placeholder={t('product_form.target_qty_placeholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('product_form.notes_label')}</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('product_form.notes_placeholder')}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
      >
        {isLoading ? t('common.saving') : t('common.save')}
      </button>
    </form>
  )
}
