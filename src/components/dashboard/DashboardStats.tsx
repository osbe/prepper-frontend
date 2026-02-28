import { useTranslation } from 'react-i18next'
import type { Product, StockEntry } from '../../types'

interface Props {
  products: Product[]
  expired: StockEntry[]
  expiring: StockEntry[]
  low: Product[]
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

const MS_PER_DAY = 86_400_000

// Appending T00:00:00 forces local-time parsing (bare YYYY-MM-DD is parsed as UTC).
// Returns null if the string is not a valid date.
function daysUntil(dateString: string): number | null {
  const expiry = new Date(dateString + 'T00:00:00')
  if (isNaN(expiry.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY)
}

export default function DashboardStats({ products, expired, expiring, low }: Props) {
  const { t } = useTranslation()

  const atTarget = products.filter((p) => p.currentStock >= p.targetQuantity).length
  const readinessPct = products.length > 0 ? Math.round((atTarget / products.length) * 100) : 0

  const atRiskIds = new Set([
    ...expired.map((e) => e.productId),
    ...expiring.map((e) => e.productId),
    ...low.map((p) => p.id),
  ])
  const atRisk = atRiskIds.size

  const atRiskParts: string[] = []
  if (expired.length > 0) atRiskParts.push(t('dashboard.stats_n_expired', { count: expired.length }))
  if (expiring.length > 0) atRiskParts.push(t('dashboard.stats_n_expiring', { count: expiring.length }))
  if (low.length > 0) atRiskParts.push(t('dashboard.stats_n_low', { count: low.length }))
  const atRiskDetail = atRiskParts.join(' · ')

  const soonestExpiryDate = expiring
    .map((e) => e.expiryDate)
    .filter((d): d is string => d !== null)
    .sort()[0]

  const daysRemaining = soonestExpiryDate ? daysUntil(soonestExpiryDate) : null

  let expiryValue: string
  if (daysRemaining === null) {
    expiryValue = t('dashboard.stats_expiry_beyond_30d')
  } else if (daysRemaining <= 0) {
    expiryValue = t('dashboard.stats_expires_today')
  } else if (daysRemaining === 1) {
    expiryValue = t('dashboard.stats_one_day')
  } else {
    expiryValue = t('dashboard.stats_days_remaining', { count: daysRemaining })
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label={t('dashboard.stats_products')}
        value={products.length}
        sub={t('dashboard.stats_at_target', { count: atTarget })}
      />
      <StatCard
        label={t('dashboard.stats_readiness')}
        value={`${readinessPct}%`}
      />
      <StatCard
        label={t('dashboard.stats_at_risk')}
        value={atRisk}
        sub={atRisk > 0 ? atRiskDetail : undefined}
      />
      <StatCard
        label={t('dashboard.stats_closest_expiry')}
        value={expiryValue}
      />
    </div>
  )
}
