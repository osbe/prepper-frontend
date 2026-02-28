import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StockEntryPayload, Unit } from '../../types'

interface Props {
  unit: Unit
  onSubmit: (payload: StockEntryPayload) => void
  isLoading?: boolean
  error?: string | null
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr)
  const targetMonth = d.getMonth() + months
  d.setMonth(targetMonth)
  // If the day overflowed (e.g. March 31 + 6 months → Oct 1), clamp to last day of target month
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0)
  }
  return d.toISOString().slice(0, 10)
}

export default function WaterStockEntryForm({ unit, onSubmit, isLoading, error }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [showOptional, setShowOptional] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const purchasedDate = today()
    const expiryDate = addMonths(purchasedDate, 6)
    onSubmit({
      quantity: parseFloat(quantity),
      subType: name.trim() || null,
      purchasedDate,
      expiryDate,
      location: location.trim() || null,
      notes: notes.trim() || null,
    })
  }

  const inputClass =
    'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Batch name */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('stock_form.name_label')}</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('stock_form.name_placeholder')}
          required
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          {t('stock_form.quantity_label', { unit: t(`units.${unit}`) })}
        </label>
        <input
          className={inputClass}
          type="number"
          min="0.01"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 text-white font-medium py-4 rounded-xl transition-colors text-lg"
      >
        {isLoading ? t('stock_form.adding_button') : t('stock_form.add_button')}
      </button>

      {/* Optional details */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptional((o) => !o)}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5"
        >
          {t('stock_form.optional_details')}
          <span className="text-xs">{showOptional ? '▲' : '▼'}</span>
        </button>

        {showOptional && (
          <div className="space-y-4 mt-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('stock_form.location_label')}</label>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('stock_form.location_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('stock_form.notes_label')}</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
