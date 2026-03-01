import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product, ProductPayload } from '../../types'

interface Props {
    initial?: Product
    onSubmit: (payload: ProductPayload) => void
    isLoading?: boolean
    error?: string | null
}

const LITERS_PER_PERSON_PER_DAY = 5
const DAYS = 7

export default function WaterForm({ initial, onSubmit, isLoading, error }: Props) {
    const { t } = useTranslation()
    const [persons, setPersons] = useState(
        initial?.targetQuantity
            ? String(Math.round(initial.targetQuantity / (LITERS_PER_PERSON_PER_DAY * DAYS)))
            : '',
    )
    const computedLiters = persons ? Number(persons) * LITERS_PER_PERSON_PER_DAY * DAYS : null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            name: initial?.name || t('categories.WATER'),
            category: 'WATER',
            unit: 'LITERS',
            targetQuantity: computedLiters ?? 0,
            notes: null,
        })
    }

    const inputClass =
        'w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors'

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('product_form.persons_label')}</label>
                <input
                    className={inputClass}
                    type="number"
                    min="1"
                    step="1"
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                    placeholder="4"
                    required
                />
                {computedLiters !== null && (
                    <p className="text-gray-500 text-xs mt-1">
                        = {computedLiters} {t('units.LITERS')} ({t('product_form.persons_hint', { days: DAYS, lpd: LITERS_PER_PERSON_PER_DAY })})
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
            >
                {isLoading ? t('common.saving') : t('common.save')}
            </button>
        </form>
    )
}
