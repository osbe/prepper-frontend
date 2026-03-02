import { useTranslation } from 'react-i18next'
import type { Category, StockEntry, Unit } from '../../types'
import { useFormatDate } from '../../i18n/useFormatDate'
import { ClockIcon, EditIcon, TakeOutIcon } from '../ui/icons'
import { getUnitStep } from './unitStep'

interface Props {
  entry: StockEntry
  unit: Unit
  category: Category
  productName: string
  isFirst: boolean
  onPatch: (id: number, quantity: number) => void
  onDelete: (id: number) => void
  onEdit?: (id: number) => void
  isMutating: boolean
  deleteOnUse?: boolean
  count?: number
}

export default function StockEntryRow({
  entry,
  unit,
  category,
  productName,
  isFirst,
  onPatch,
  onDelete,
  onEdit,
  isMutating,
  deleteOnUse,
  count,
}: Props) {
  const { t } = useTranslation()
  const formatDate = useFormatDate()

  const handleUseOne = () => {
    const step = getUnitStep(unit)
    if (deleteOnUse || entry.quantity <= step) {
      onDelete(entry.id)
    } else {
      onPatch(entry.id, +(entry.quantity - step).toFixed(4))
    }
  }

  const actionColor =
    entry.expiryStatus === 'EXPIRED'
      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800'
      : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800'

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-gray-900 dark:text-white text-lg font-semibold">{entry.subType ?? productName}</h3>
          {isFirst && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200"
              title={t('stock_entry.consume_next')}
            >
              <ClockIcon className="w-3 h-3 shrink-0" />
            </span>
          )}
        </div>
        <button
          onClick={handleUseOne}
          disabled={isMutating}
          aria-label={t('stock_entry.use_one_button')}
          className="inline-flex items-center justify-center p-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-colors disabled:opacity-50 -mr-1.5 -mt-1 shrink-0 ml-2"
        >
          <TakeOutIcon className="w-6 h-6 shrink-0" />
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 -mx-4" />

      <div className="bg-gray-50 dark:bg-gray-700/30 -mx-4 px-4 py-3 mb-0">
        <p className="text-gray-900 dark:text-white text-base font-semibold mb-2">
          {(count ?? 1) > 1 ? `${count} × ` : ''}{entry.quantity} {t(`units.${unit}`)}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('stock_entry.location_label')}</span>
            <p className="text-gray-900 dark:text-white">{entry.location ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('stock_entry.expires_label')}</span>
            <p className={
              entry.expiryStatus === 'EXPIRED' ? 'text-red-600 dark:text-red-400 font-medium' :
              entry.expiryStatus === 'APPROACHING' ? 'text-yellow-600 dark:text-yellow-400 font-medium' :
              'text-gray-900 dark:text-white'
            }>
              {entry.expiryDate ? formatDate(entry.expiryDate) : '—'}
            </p>
          </div>
        </div>

        {entry.expiryStatus && (
          <p className={`text-xs rounded-lg px-3 py-2 mt-3 ${actionColor}`}>
            {t(`action.${category}.${entry.expiryStatus}`)}
          </p>
        )}
      </div>

      {onEdit && (
        <div className="border-t border-gray-200 dark:border-gray-700 -mx-4 -mb-4 px-4 py-2">
          <button
            onClick={() => onEdit(entry.id)}
            disabled={isMutating}
            aria-label={t('common.edit')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <EditIcon className="w-3.5 h-3.5 shrink-0" />
            {t('common.edit')}
          </button>
        </div>
      )}
    </div>
  )
}
