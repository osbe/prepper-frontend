import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useProduct, useProductStock, useDeleteProduct, useAddStockEntry } from '../hooks/useProducts'
import { usePatchStock, useDeleteStock } from '../hooks/useStock'
import { CATEGORY_LABELS, UNIT_LABELS } from '../types'
import StockEntryRow from '../components/stock/StockEntryRow'
import StockEntryForm from '../components/stock/StockEntryForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()

  const { data: product, isLoading: pLoading, error: pError } = useProduct(productId)
  const { data: stock = [], isLoading: sLoading } = useProductStock(productId)

  const deleteProduct = useDeleteProduct()
  const addStock = useAddStockEntry(productId)
  const patchStock = usePatchStock(productId)
  const deleteStock = useDeleteStock(productId)

  const [showDeleteProduct, setShowDeleteProduct] = useState(false)
  const [showAddStock, setShowAddStock] = useState(false)
  const [addStockError, setAddStockError] = useState<string | null>(null)

  if (pLoading) return <p className="text-gray-400 text-sm">Loading…</p>
  if (pError || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">Product not found.</p>
        <Link to="/products" className="text-green-400 hover:underline text-sm mt-2 block">
          ← Back to products
        </Link>
      </div>
    )
  }

  const handleDeleteProduct = async () => {
    await deleteProduct.mutateAsync(productId)
    navigate('/products')
  }

  const handleAddStock = async (payload: Parameters<typeof addStock.mutateAsync>[0]) => {
    setAddStockError(null)
    try {
      await addStock.mutateAsync(payload)
      setShowAddStock(false)
    } catch (e: unknown) {
      setAddStockError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  const handlePatch = (entryId: number, quantity: number) => {
    patchStock.mutate({ id: entryId, quantity })
  }

  const handleDeleteEntry = (entryId: number) => {
    deleteStock.mutate(entryId)
  }

  const unit = UNIT_LABELS[product.unit]

  return (
    <div>
      <div className="mb-6">
        <Link to="/products" className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Products
        </Link>
      </div>

      {/* Product header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {CATEGORY_LABELS[product.category]} · target {product.targetQuantity} {unit}
            </p>
            {product.notes && (
              <p className="text-gray-300 text-sm mt-2">{product.notes}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              to={`/products/${productId}/edit`}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteProduct(true)}
              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                product.currentStock >= product.targetQuantity ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min((product.currentStock / product.targetQuantity) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-300 whitespace-nowrap">
            {product.currentStock} / {product.targetQuantity} {unit}
          </span>
        </div>
      </div>

      {/* Stock entries */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Stock batches</h2>
        <button
          onClick={() => setShowAddStock(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add stock
        </button>
      </div>

      {sLoading && <p className="text-gray-400 text-sm">Loading stock…</p>}

      {!sLoading && stock.length === 0 && (
        <p className="text-gray-500 text-sm">No stock entries yet.</p>
      )}

      <div className="space-y-3">
        {stock.map((entry, i) => (
          <StockEntryRow
            key={entry.id}
            entry={entry}
            unit={product.unit}
            isFirst={i === 0}
            onPatch={handlePatch}
            onDelete={handleDeleteEntry}
            isMutating={patchStock.isPending || deleteStock.isPending}
          />
        ))}
      </div>

      {/* Modals */}
      {showDeleteProduct && (
        <ConfirmDialog
          title="Delete product"
          message={`This will permanently delete "${product.name}" and all ${stock.length} stock batches. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteProduct}
          onCancel={() => setShowDeleteProduct(false)}
        />
      )}

      {showAddStock && (
        <Modal title="Add stock batch" onClose={() => setShowAddStock(false)}>
          <StockEntryForm
            unit={product.unit}
            onSubmit={handleAddStock}
            isLoading={addStock.isPending}
            error={addStockError}
          />
        </Modal>
      )}
    </div>
  )
}
