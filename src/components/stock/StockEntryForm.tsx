import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StockEntryPayload, Unit } from '../../types'
import { getUnitStep } from './unitStep'

interface InitialValues {
  quantity?: number
  subType?: string | null
  purchasedDate?: string | null
  expiryDate?: string | null
  location?: string | null
}

interface Props {
  unit: Unit
  onSubmit: (payload: StockEntryPayload, count: number) => void
  isLoading?: boolean
  error?: string | null
  hideExpiryDate?: boolean
  showSubType?: boolean
  initialValues?: InitialValues
  mode?: 'add' | 'edit'
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

function parseExpiryDate(date: string | null | undefined) {
  if (!date) return { year: '', month: '', day: '' }
  const [y, m, d] = date.split('-')
  return { year: y, month: String(parseInt(m)), day: String(parseInt(d)) }
}

export default function StockEntryForm({ unit, onSubmit, isLoading, error, hideExpiryDate, showSubType, initialValues, mode = 'add' }: Props) {
  const { t, i18n } = useTranslation()
  const { year: initYear, month: initMonth, day: initDay } = parseExpiryDate(initialValues?.expiryDate)
  const [quantity, setQuantity] = useState(String(initialValues?.quantity ?? getUnitStep(unit)))
  const [multiMode, setMultiMode] = useState(false)
  const [count, setCount] = useState(2)
  const [subType, setSubType] = useState(initialValues?.subType ?? '')
  const [purchasedDate] = useState(initialValues?.purchasedDate ?? today())
  const [expiryYear, setExpiryYear] = useState(initYear)
  const [expiryMonth, setExpiryMonth] = useState(initMonth)
  const [expiryDay, setExpiryDay] = useState(initDay)
  const [location, setLocation] = useState(initialValues?.location ?? '')
  const [showOptional, setShowOptional] = useState(!!initialValues?.location)

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExpiryYear(e.target.value)
    if (expiryDay && parseInt(expiryDay) > daysInMonth(e.target.value, expiryMonth)) setExpiryDay('')
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExpiryMonth(e.target.value)
    if (expiryDay && parseInt(expiryDay) > daysInMonth(expiryYear, e.target.value)) setExpiryDay('')
  }

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
      notes: null,
    }, mode === 'add' && multiMode ? count : 1)
  }

  const step = getUnitStep(unit)
  const increment = () => setQuantity(q => String(+((parseFloat(q) || 0) + step).toFixed(4)))
  const decrement = () => setQuantity(q => String(+(Math.max(0, (parseFloat(q) || 0) - step)).toFixed(4)))

  const inputClass =
    'w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors'
  const selectClass =
    'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors min-w-0'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Quantity stepper */}
      <div>
        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
          {t('stock_form.quantity_label', { unit: t(`units.${unit}`) })}
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={decrement}
            className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 text-gray-900 dark:text-white text-2xl font-medium transition-colors flex items-center justify-center"
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
            className="w-24 text-center text-3xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:outline-none py-1"
          />
          <button
            type="button"
            onClick={increment}
            className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 text-gray-900 dark:text-white text-2xl font-medium transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {mode === 'add' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={multiMode}
              onChange={e => setMultiMode(e.target.checked)}
              className="w-4 h-4 rounded accent-green-500"
            />
            {t('stock_form.multi_mode_label')}
          </label>
          {multiMode && (
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stock_form.count_label')}</label>
              <input
                type="number"
                min="2"
                step="1"
                value={count}
                onChange={e => setCount(Math.max(2, parseInt(e.target.value) || 2))}
                required
                className="w-24 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          )}
        </div>
      )}

      {showSubType && (
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stock_form.sub_type_label')}</label>
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
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stock_form.expiry_date_label')}</label>
          <div className="flex gap-2">
            <select
              className={`${selectClass} w-[5.5rem] shrink-0`}
              value={expiryYear}
              onChange={handleYearChange}
            >
              <option value="">—</option>
              {Array.from({ length: 31 }, (_, i) => new Date().getFullYear() + i).map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <select
              className={`${selectClass} flex-1`}
              value={expiryMonth}
              onChange={handleMonthChange}
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
        {mode === 'edit'
        ? (isLoading ? t('common.saving') : t('common.save'))
        : (isLoading ? t('stock_form.adding_button') : t('stock_form.add_button'))
      }
      </button>

      {/* Optional details */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptional(o => !o)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1.5"
        >
          {t('stock_form.optional_details')}
          <span className="text-xs">{showOptional ? '▲' : '▼'}</span>
        </button>

        {showOptional && (
          <div className="space-y-4 mt-3">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stock_form.location_label')}</label>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('stock_form.location_placeholder')}
              />
            </div>

          </div>
        )}
      </div>
    </form>
  )
}
