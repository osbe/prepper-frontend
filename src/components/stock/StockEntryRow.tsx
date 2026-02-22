import { useState } from 'react'
import type { StockEntry, Unit } from '../../types'
import { UNIT_LABELS } from '../../types'

interface Props {
  entry: StockEntry
  unit: Unit
  isFirst: boolean
  onPatch: (id: number, quantity: number) => void
  onDelete: (id: number) => void
  isMutating: boolean
}

export default function StockEntryRow({
  entry,
  unit,
  isFirst,
  onPatch,
  onDelete,
  isMutating,
}: Props) {
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
    entry.recommendedAction
      ? entry.expiryDate < new Date().toISOString().slice(0, 10)
        ? 'text-red-400 bg-red-900/20 border border-red-800'
        : 'text-yellow-400 bg-yellow-900/20 border border-yellow-800'
      : ''

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      {isFirst && (
        <span className="inline-block text-xs font-semibold bg-green-800 text-green-200 px-2 py-0.5 rounded-full mb-2">
          Consume next
        </span>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
        <div>
          <span className="text-gray-400">Quantity</span>
          <p className="text-white font-medium">
            {entry.quantity} {UNIT_LABELS[unit]}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Location</span>
          <p className="text-white">{entry.location ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-400">Purchased</span>
          <p className="text-white">{entry.purchasedDate}</p>
        </div>
        <div>
          <span className="text-gray-400">Expires</span>
          <p className="text-white">{entry.expiryDate}</p>
        </div>
      </div>

      {entry.recommendedAction && (
        <p className={`text-xs rounded-lg px-3 py-2 mb-3 ${actionColor}`}>
          {entry.recommendedAction}
        </p>
      )}

      {editing ? (
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            min="0"
            step="any"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handlePatch}
            disabled={isMutating}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            Update qty
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            disabled={isMutating}
            className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
