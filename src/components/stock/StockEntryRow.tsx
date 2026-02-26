import { useState } from 'react'
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
  const [editing, setEditing] = useState(false)
  const [qty, setQty] = useState(entry.quantity.toString())

  const handlePatch = () => {
    const val = parseFloat(qty)
    if (!isNaN(val)) {
      onPatch(entry.id, val)
      setEditing(false)
    }
  }

  const actionColor =
    entry.expiryStatus === 'EXPIRED'
      ? 'text-red-400 bg-red-900/20 border border-red-800'
      : 'text-yellow-400 bg-yellow-900/20 border border-yellow-800'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
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

      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="number"
            min="0"
            step="any"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePatch}
              disabled={isMutating}
              className="flex-1 sm:flex-none px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {t('common.save')}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            {t('stock_entry.update_qty_button')}
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            disabled={isMutating}
            className="flex-1 sm:flex-none px-3 py-2 bg-red-800 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  )
}
