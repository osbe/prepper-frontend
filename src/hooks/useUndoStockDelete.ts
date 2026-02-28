import { useState } from 'react'
import type { MutateOptions } from '@tanstack/react-query'
import type { StockEntry, StockEntryPayload } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeleteMutate = (id: number, options?: MutateOptions<any, Error, number, any>) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AddMutate = (payload: StockEntryPayload, options?: MutateOptions<any, Error, StockEntryPayload, any>) => void

export function useUndoStockDelete(
  stock: StockEntry[],
  deleteMutate: DeleteMutate,
  addMutate: AddMutate,
  onUndoError: () => void,
) {
  const [deletedEntry, setDeletedEntry] = useState<StockEntry | null>(null)

  function handleDeleteEntry(entryId: number) {
    const entry = stock.find((e) => e.id === entryId)
    if (!entry) return
    deleteMutate(entryId, {
      onSuccess: () => setDeletedEntry(entry),
    })
  }

  function handleUndoDelete() {
    if (!deletedEntry) return
    addMutate({
      quantity: deletedEntry.quantity,
      subType: deletedEntry.subType,
      purchasedDate: deletedEntry.purchasedDate,
      expiryDate: deletedEntry.expiryDate,
      location: deletedEntry.location,
      notes: deletedEntry.notes,
    }, {
      onSuccess: () => setDeletedEntry(null),
      onError: () => {
        setDeletedEntry(null)
        onUndoError()
      },
    })
  }

  return {
    deletedEntry,
    handleDeleteEntry,
    handleUndoDelete,
    clearDeletedEntry: () => setDeletedEntry(null),
  }
}
