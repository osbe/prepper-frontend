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

  const atRiskDetail = [
    expired.length > 0 && t('dashboard.stats_n_expired', { count: expired.length }),
    expiring.length > 0 && t('dashboard.stats_n_expiring', { count: expiring.length }),
    low.length > 0 && t('dashboard.stats_n_low', { count: low.length }),
  ].filter(Boolean).join(' · ')

  const soonestExpiryDate = expiring
    .map((e) => e.expiryDate)
    .filter((d): d is string => d !== null)
    .sort()[0]

  const daysRemaining = soonestExpiryDate ? (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(soonestExpiryDate)
    expiry.setHours(0, 0, 0, 0)
    return Math.round((expiry.getTime() - today.getTime()) / 86400000)
  })() : null

  const expiryValue = daysRemaining === null ? t('dashboard.stats_expiry_beyond_30d')
    : daysRemaining === 0 ? t('dashboard.stats_expires_today')
    : daysRemaining === 1 ? t('dashboard.stats_one_day')
    : t('dashboard.stats_days_remaining', { count: daysRemaining })

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
      {atRisk > 0 && (
        <StatCard
          label={t('dashboard.stats_at_risk')}
          value={atRisk}
          sub={atRiskDetail}
        />
      )}
      <StatCard
        label={t('dashboard.stats_closest_expiry')}
        value={expiryValue}
      />
    </div>
  )
}
