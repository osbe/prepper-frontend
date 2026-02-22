import { useState } from 'react'
import type { Category, Product, ProductPayload, Unit } from '../../types'
import { CATEGORIES, CATEGORY_LABELS, UNITS, UNIT_LABELS } from '../../types'

interface Props {
  initial?: Product
  onSubmit: (payload: ProductPayload) => void
  isLoading?: boolean
  error?: string | null
}

export default function ProductForm({ initial, onSubmit, isLoading, error }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'WATER')
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? 'LITERS')
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
        <label className="block text-sm text-gray-400 mb-1">Name</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mineral Water"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Category</label>
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Unit</label>
        <select
          className={inputClass}
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {UNIT_LABELS[u]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Target quantity</label>
        <input
          className={inputClass}
          type="number"
          min="0"
          step="any"
          value={targetQuantity}
          onChange={(e) => setTargetQuantity(e.target.value)}
          placeholder="e.g. 100"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any extra info…"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
      >
        {isLoading ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
