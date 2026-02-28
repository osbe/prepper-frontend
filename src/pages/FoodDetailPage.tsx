import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProduct, useProductStock, useDeleteProduct, useAddStockEntry } from '../hooks/useProducts'
import { usePatchStock, useDeleteStock } from '../hooks/useStock'
import { useUndoStockDelete } from '../hooks/useUndoStockDelete'
import StockEntryRow from '../components/stock/StockEntryRow'
import StockEntryForm from '../components/stock/StockEntryForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomSheet from '../components/ui/BottomSheet'
import Toast from '../components/ui/Toast'
import { EditIcon, TrashIcon } from '../components/ui/icons'

interface Props {
  forceId?: number
}

export default function FoodDetailPage({ forceId }: Props) {
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
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { deletedEntry, handleDeleteEntry, handleUndoDelete, clearDeletedEntry } = useUndoStockDelete(
    stock,
    deleteStock.mutate,
    addStock.mutate,
    () => setAddStockError(t('errors.something_went_wrong')),
  )

  if (pLoading) return <p className="text-gray-400 text-sm">{t('common.loading')}</p>
  if (pError || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">{t('products.not_found')}</p>
        <Link to="/food" className="text-green-400 hover:underline text-sm mt-2 block">
          {t('products.back_from_detail')}
        </Link>
      </div>
    )
  }

  const handleDeleteProduct = async () => {
    setMutationError(null)
    try {
      await deleteProduct.mutateAsync(productId)
      navigate('/food')
    } catch (e: unknown) {
      setShowDeleteProduct(false)
      setMutationError(e instanceof Error ? e.message : t('errors.something_went_wrong'))
    }
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
    setMutationError(null)
    patchStock.mutate({ id: entryId, quantity }, {
      onError: () => setMutationError(t('errors.something_went_wrong')),
    })
  }

  const unit = t(`units.${product.unit}`)

  return (
    <div>
      <div className="mb-6">
        <Link to="/food" className="text-gray-400 hover:text-white text-sm transition-colors">
          {t('products.back')}
        </Link>
      </div>

      {/* Product header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{product.name}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {t(`categories.${product.category}`)} · {t('products.target', { qty: product.targetQuantity, unit })}
            </p>
            {product.notes && (
              <p className="text-gray-300 text-sm mt-2">{product.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <Link
              to={`/food/${productId}/edit`}
              aria-label={t('common.edit')}
              className="inline-flex items-center justify-center p-1 text-gray-400 hover:text-white transition-colors"
            >
              <EditIcon />
            </Link>
            <button
              onClick={() => setShowDeleteProduct(true)}
              aria-label={t('common.delete')}
              className="inline-flex items-center justify-center p-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <TrashIcon />
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

      {mutationError && (
        <p className="text-red-400 text-sm mb-4">{mutationError}</p>
      )}

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
            isMutating={patchStock.isPending || deleteStock.isPending || !!deletedEntry}
          />
        ))}
      </div>

      {/* Modals */}
      {showDeleteProduct && (
        <ConfirmDialog
          title={t('products.delete_title')}
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
            showSubType
          />
        </BottomSheet>
      )}

      {/* FAB */}
      {!showAddStock && (
        <button
          onClick={() => setShowAddStock(true)}
          aria-label={t('products.add_stock_button')}
          className="fixed bottom-20 sm:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-3xl shadow-lg transition-colors flex items-center justify-center"
        >
          +
        </button>
      )}

      {deletedEntry && (
        <Toast
          key={deletedEntry.id}
          message={t('stock_entry.removed')}
          actionLabel={t('common.undo')}
          onAction={handleUndoDelete}
          onDismiss={clearDeletedEntry}
        />
      )}
    </div>
  )
}
