import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProduct, useProductStock, useDeleteProduct, useAddStockEntry } from '../hooks/useProducts'
import { usePatchStock, useDeleteStock } from '../hooks/useStock'
import StockEntryRow from '../components/stock/StockEntryRow'
import StockEntryForm from '../components/stock/StockEntryForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomSheet from '../components/ui/BottomSheet'
import { EditIcon, TrashIcon } from '../components/ui/icons'

interface Props {
  forceId?: number
}

export default function WaterDetailPage({ forceId }: Props) {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const productId = forceId ?? Number(id)
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

  if (pLoading) return <p className="text-gray-400 text-sm">{t('common.loading')}</p>
  if (pError || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">{t('products.not_found')}</p>
        <Link to="/" className="text-green-400 hover:underline text-sm mt-2 block">
          {t('not_found.cta')}
        </Link>
      </div>
    )
  }

  const handleDeleteProduct = async () => {
    await deleteProduct.mutateAsync(productId)
    navigate('/')
  }

  const handleAddStock = async (payload: Parameters<typeof addStock.mutateAsync>[0]) => {
    setAddStockError(null)
    try {
      await addStock.mutateAsync(payload)
      setShowAddStock(false)
    } catch (e: unknown) {
      setAddStockError(e instanceof Error ? e.message : t('errors.something_went_wrong'))
    }
  }

  const handlePatch = (entryId: number, quantity: number) => {
    patchStock.mutate({ id: entryId, quantity })
  }

  const handleDeleteEntry = (entryId: number) => {
    deleteStock.mutate(entryId)
  }

  const unit = t(`units.${product.unit}`)

  return (
    <div>

      {/* Product header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{product.name}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {t(`categories.${product.category}`)} · {t('products.target', { qty: product.targetQuantity, unit })}
            </p>
            {product.notes && (
              <p className="text-gray-300 text-sm mt-2">{product.notes}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to={`/water/edit`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <EditIcon />
              {t('common.edit')}
            </Link>
            <button
              onClick={() => setShowDeleteProduct(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-800 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              <TrashIcon />
              {t('common.delete')}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${product.currentStock >= product.targetQuantity ? 'bg-green-500' : 'bg-red-500'
                }`}
              style={{
                width: `${Math.min((product.currentStock / product.targetQuantity) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-300 shrink-0">
            {product.currentStock} / {product.targetQuantity} {unit}
          </span>
        </div>
      </div>

      {/* Stock entries */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{t('products.stock_batches_title')}</h2>
      </div>

      {sLoading && <p className="text-gray-400 text-sm">{t('products.loading_stock')}</p>}

      {!sLoading && stock.length === 0 && (
        <p className="text-gray-500 text-sm">{t('products.no_stock')}</p>
      )}

      <div className="space-y-3">
        {stock.map((entry, i) => (
          <StockEntryRow
            key={entry.id}
            entry={entry}
            unit={product.unit}
            category={product.category}
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
          title={t('products.delete_water_title')}
          message={t('products.delete_confirm', { name: product.name, count: stock.length })}
          confirmLabel={t('common.delete')}
          danger
          onConfirm={handleDeleteProduct}
          onCancel={() => setShowDeleteProduct(false)}
        />
      )}

      {showAddStock && (
        <BottomSheet title={t('stock_form.modal_title')} onClose={() => setShowAddStock(false)}>
          <StockEntryForm
            unit={product.unit}
            onSubmit={handleAddStock}
            isLoading={addStock.isPending}
            error={addStockError}
          />
        </BottomSheet>
      )}

      {/* FAB */}
      {!showAddStock && (
        <button
          onClick={() => setShowAddStock(true)}
          aria-label={t('products.add_stock_button')}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-3xl shadow-lg transition-colors flex items-center justify-center"
        >
          +
        </button>
      )}
    </div>
  )
}
