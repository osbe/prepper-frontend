import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StockEntryPayload, Unit } from '../../types'

interface Props {
  unit: Unit
  onSubmit: (payload: StockEntryPayload) => void
  isLoading?: boolean
  error?: string | null
  hideExpiryDate?: boolean
  showSubType?: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function getExpiryDate(baseDate: string, monthsToAdd: number) {
  const d = new Date(baseDate)
  d.setMonth(d.getMonth() + monthsToAdd)
  return d.toISOString().slice(0, 10)
}

function daysInMonth(year: string, month: string): number {
  if (!year || !month) return 31
  return new Date(parseInt(year), parseInt(month), 0).getDate()
}

function getMonthName(month: number, language: string): string {
  const locale = language.startsWith('sv') ? 'sv-SE' : 'en-GB'
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, month - 1, 1))
}

export default function StockEntryForm({ unit, onSubmit, isLoading, error, hideExpiryDate, showSubType }: Props) {
  const { t, i18n } = useTranslation()
  const [quantity, setQuantity] = useState('1')
  const [subType, setSubType] = useState('')
  const [purchasedDate] = useState(today())
  const [expiryYear, setExpiryYear] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryDay, setExpiryDay] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [showOptional, setShowOptional] = useState(false)

  // Reset day if it exceeds the days in the selected month/year
  useEffect(() => {
    const max = daysInMonth(expiryYear, expiryMonth)
    if (expiryDay && parseInt(expiryDay) > max) setExpiryDay('')
  }, [expiryYear, expiryMonth])

  const expiryDateValue =
    expiryYear && expiryMonth && expiryDay
      ? `${expiryYear}-${expiryMonth.padStart(2, '0')}-${expiryDay.padStart(2, '0')}`
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      quantity: parseFloat(quantity),
      subType: showSubType ? (subType.trim() || null) : undefined,
      purchasedDate: purchasedDate || null,
      expiryDate: hideExpiryDate ? getExpiryDate(purchasedDate || today(), 6) : expiryDateValue,
      location: location.trim() || null,
      notes: notes.trim() || null,
    })
  }

  const increment = () => setQuantity(q => String((parseFloat(q) || 0) + 1))
  const decrement = () => setQuantity(q => String(Math.max(0, (parseFloat(q) || 0) - 1)))

  const inputClass =
    'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors'
  const selectClass =
    'bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-green-500 transition-colors min-w-0'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Quantity stepper */}
      <div>
        <label className="block text-sm text-gray-400 mb-3 text-center">
          {t('stock_form.quantity_label', { unit: t(`units.${unit}`) })}
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={decrement}
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-2xl font-medium transition-colors flex items-center justify-center"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-24 text-center text-3xl font-bold bg-transparent text-white border-b-2 border-gray-600 focus:border-green-500 focus:outline-none py-1"
          />
          <button
            type="button"
            onClick={increment}
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-2xl font-medium transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {showSubType && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('stock_form.sub_type_label')}</label>
          <input
            className={inputClass}
            value={subType}
            onChange={(e) => setSubType(e.target.value)}
            placeholder={t('stock_form.sub_type_placeholder')}
          />
        </div>
      )}

      {!hideExpiryDate && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('stock_form.expiry_date_label')}</label>
          <div className="flex gap-2">
            <select
              className={`${selectClass} w-[5.5rem] shrink-0`}
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value)}
            >
              <option value="">—</option>
              {Array.from({ length: 31 }, (_, i) => new Date().getFullYear() + i).map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <select
              className={`${selectClass} flex-1`}
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value)}
            >
              <option value="">—</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={String(m)}>{getMonthName(m, i18n.language)}</option>
              ))}
            </select>
            <select
              className={`${selectClass} w-[4.5rem] shrink-0`}
              value={expiryDay}
              onChange={(e) => setExpiryDay(e.target.value)}
            >
              <option value="">—</option>
              {Array.from({ length: daysInMonth(expiryYear, expiryMonth) }, (_, i) => i + 1).map(d => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      )}

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
          onClick={() => setShowOptional(o => !o)}
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
