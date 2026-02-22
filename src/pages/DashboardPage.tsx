import { useExpiredStock, useExpiringStock, useLowStock } from '../hooks/useStock'
import { useProducts } from '../hooks/useProducts'
import type { StockEntry, Product } from '../types'
import { UNIT_LABELS } from '../types'
import { Link } from 'react-router-dom'

function StockAlertRow({
  entry,
  products,
  color,
}: {
  entry: StockEntry
  products: Product[]
  color: 'red' | 'yellow'
}) {
  const product = products.find((p) => p.id === entry.productId)
  const unit = product ? UNIT_LABELS[product.unit] : ''
  const borderColor = color === 'red' ? 'border-red-700' : 'border-yellow-700'
  const actionColor = color === 'red' ? 'text-red-400' : 'text-yellow-400'

  return (
    <div className={`border-l-4 ${borderColor} bg-gray-800 rounded-r-lg px-4 py-3`}>
      <div className="flex items-start justify-between">
        <div>
          <Link
            to={`/products/${entry.productId}`}
            className="font-medium text-white hover:text-green-400 transition-colors"
          >
            {product?.name ?? `Product #${entry.productId}`}
          </Link>
          <p className="text-sm text-gray-400 mt-0.5">
            {entry.quantity} {unit} · Expires {entry.expiryDate}
            {entry.location && ` · ${entry.location}`}
          </p>
          {entry.recommendedAction && (
            <p className={`text-xs mt-1 ${actionColor}`}>{entry.recommendedAction}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function LowStockRow({ product }: { product: Product }) {
  const unit = UNIT_LABELS[product.unit]
  return (
    <div className="border-l-4 border-blue-700 bg-gray-800 rounded-r-lg px-4 py-3">
      <Link
        to={`/products/${product.id}`}
        className="font-medium text-white hover:text-green-400 transition-colors"
      >
        {product.name}
      </Link>
      <p className="text-sm text-gray-400 mt-0.5">
        {product.currentStock} / {product.targetQuantity} {unit}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: expired = [], isLoading: l1 } = useExpiredStock()
  const { data: expiring = [], isLoading: l2 } = useExpiringStock()
  const { data: low = [], isLoading: l3 } = useLowStock()
  const { data: products = [] } = useProducts()

  const isLoading = l1 || l2 || l3
  const allGood = expired.length === 0 && expiring.length === 0 && low.length === 0

  if (isLoading) {
    return <p className="text-gray-400 text-sm">Loading…</p>
  }

  if (allGood) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-green-400">All good!</h2>
        <p className="text-gray-400 mt-1">No expired, expiring, or low-stock items.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {expired.length > 0 && (
        <section>
          <h2 className="text-red-400 font-semibold mb-3">
            Expired ({expired.length})
          </h2>
          <div className="space-y-2">
            {expired.map((e) => (
              <StockAlertRow key={e.id} entry={e} products={products} color="red" />
            ))}
          </div>
        </section>
      )}

      {expiring.length > 0 && (
        <section>
          <h2 className="text-yellow-400 font-semibold mb-3">
            Expiring soon ({expiring.length})
          </h2>
          <div className="space-y-2">
            {expiring.map((e) => (
              <StockAlertRow key={e.id} entry={e} products={products} color="yellow" />
            ))}
          </div>
        </section>
      )}

      {low.length > 0 && (
        <section>
          <h2 className="text-blue-400 font-semibold mb-3">
            Low stock ({low.length})
          </h2>
          <div className="space-y-2">
            {low.map((p) => (
              <LowStockRow key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
