import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StockEntryPayload, Unit } from '../../types'

interface Props {
  unit: Unit
  onSubmit: (payload: StockEntryPayload) => void
  isLoading?: boolean
  error?: string | null
  hideExpiryDate?: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function getExpiryDate(baseDate: string, monthsToAdd: number) {
  const d = new Date(baseDate)
  d.setMonth(d.getMonth() + monthsToAdd)
  return d.toISOString().slice(0, 10)
}

export default function StockEntryForm({ unit, onSubmit, isLoading, error, hideExpiryDate }: Props) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState('')
  const [purchasedDate, setPurchasedDate] = useState(today())
  const [expiryDate, setExpiryDate] = useState(hideExpiryDate ? getExpiryDate(today(), 6) : '')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      quantity: parseFloat(quantity),
      purchasedDate,
      expiryDate: hideExpiryDate ? getExpiryDate(purchasedDate, 6) : expiryDate,
      location: location.trim() || null,
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
        <label className="block text-sm text-gray-400 mb-1">
          {t('stock_form.quantity_label', { unit: t(`units.${unit}`) })}
        </label>
        <input
          className={inputClass}
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={t('stock_form.quantity_placeholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('stock_form.purchased_date_label')}</label>
        <input
          className={inputClass}
          type="date"
          value={purchasedDate}
          onChange={(e) => setPurchasedDate(e.target.value)}
          required
        />
      </div>

      {!hideExpiryDate && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('stock_form.expiry_date_label')}</label>
          <input
            className={inputClass}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>
      )}

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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
      >
        {isLoading ? t('stock_form.adding_button') : t('stock_form.add_button')}
      </button>
    </form>
  )
}
