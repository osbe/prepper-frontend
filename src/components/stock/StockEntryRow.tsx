import { useTranslation } from 'react-i18next'
import type { Category, StockEntry, Unit } from '../../types'
import { useFormatDate } from '../../i18n/useFormatDate'
import { EditIcon, TakeOutIcon } from '../ui/icons'

interface Props {
  entry: StockEntry
  unit: Unit
  category: Category
  isFirst: boolean
  onPatch: (id: number, quantity: number) => void
  onDelete: (id: number) => void
  onEdit?: (id: number) => void
  isMutating: boolean
  deleteOnUse?: boolean
}

export default function StockEntryRow({
  entry,
  unit,
  category,
  isFirst,
  onPatch,
  onDelete,
  onEdit,
  isMutating,
  deleteOnUse,
}: Props) {
  const { t } = useTranslation()
  const formatDate = useFormatDate()

  const handleUseOne = () => {
    if (deleteOnUse || entry.quantity <= 1) {
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          {isFirst && (
            <span className="inline-block text-xs font-semibold bg-green-800 text-green-200 px-2 py-0.5 rounded-full">
              {t('stock_entry.consume_next')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 -mr-1.5 -mt-1 shrink-0 ml-2">
          {onEdit && (
            <button
              onClick={() => onEdit(entry.id)}
              disabled={isMutating}
              aria-label={t('common.edit')}
              className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <EditIcon />
            </button>
          )}
          <button
            onClick={handleUseOne}
            disabled={isMutating}
            aria-label={t('stock_entry.use_one_button')}
            className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-amber-400 transition-colors disabled:opacity-50"
          >
            <TakeOutIcon />
          </button>
        </div>
      </div>

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
            <span className="text-gray-400">
              {category === 'WATER' ? t('stock_entry.name_label') : t('stock_entry.sub_type_label')}
            </span>
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
    </div>
  )
}
