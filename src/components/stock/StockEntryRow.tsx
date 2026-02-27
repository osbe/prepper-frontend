import { useTranslation } from 'react-i18next'
import type { Category, StockEntry, Unit } from '../../types'
import { useFormatDate } from '../../i18n/useFormatDate'

interface Props {
  entry: StockEntry
  unit: Unit
  category: Category
  isFirst: boolean
  onPatch: (id: number, quantity: number) => void
  onDelete: (id: number) => void
  isMutating: boolean
}

export default function StockEntryRow({
  entry,
  unit,
  category,
  isFirst,
  onPatch,
  onDelete,
  isMutating,
}: Props) {
  const { t } = useTranslation()
  const formatDate = useFormatDate()

  const handleUseOne = () => {
    if (entry.quantity <= 1) {
      onDelete(entry.id)
    } else {
      onPatch(entry.id, entry.quantity - 1)
    }
  }

  const actionColor =
    entry.expiryStatus === 'EXPIRED'
      ? 'text-red-400 bg-red-900/20 border border-red-800'
      : 'text-yellow-400 bg-yellow-900/20 border border-yellow-800'

  return (
    <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-4">
      {isFirst && (
        <span className="inline-block text-xs font-semibold bg-green-800 text-green-200 px-2 py-0.5 rounded-full mb-2">
          {t('stock_entry.consume_next')}
        </span>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
        <div>
          <span className="text-gray-400">{t('stock_entry.quantity_label')}</span>
          <p className="text-white font-medium">
            {entry.quantity} {t(`units.${unit}`)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">{t('stock_entry.location_label')}</span>
          <p className="text-white">{entry.location ?? '—'}</p>
        </div>
        {entry.subType && (
          <div className="col-span-2">
            <span className="text-gray-400">{t('stock_entry.sub_type_label')}</span>
            <p className="text-white">{entry.subType}</p>
          </div>
        )}
        <div>
          <span className="text-gray-400">{t('stock_entry.purchased_label')}</span>
          <p className="text-white">{entry.purchasedDate ? formatDate(entry.purchasedDate) : '—'}</p>
        </div>
        <div>
          <span className="text-gray-400">{t('stock_entry.expires_label')}</span>
          <p className="text-white">{entry.expiryDate ? formatDate(entry.expiryDate) : '—'}</p>
        </div>
      </div>

      {entry.expiryStatus && (
        <p className={`text-xs rounded-lg px-3 py-2 mb-3 ${actionColor}`}>
          {t(`action.${category}.${entry.expiryStatus}`)}
        </p>
      )}

      <button
        onClick={handleUseOne}
        disabled={isMutating}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 shadow-md"
      >
        −
      </button>
    </div>
  )
}
