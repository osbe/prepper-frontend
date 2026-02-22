export type Category =
  | 'WATER'
  | 'PRESERVED_FOOD'
  | 'DRY_GOODS'
  | 'FREEZE_DRIED'
  | 'MEDICINE'
  | 'FUEL'
  | 'OTHER'

export type Unit = 'LITERS' | 'KG' | 'CANS' | 'PIECES' | 'GRAMS'


export const CATEGORIES: Category[] = [
  'WATER',
  'PRESERVED_FOOD',
  'DRY_GOODS',
  'FREEZE_DRIED',
  'MEDICINE',
  'FUEL',
  'OTHER',
]

export const FOOD_CATEGORIES: Category[] = [
  'PRESERVED_FOOD',
  'DRY_GOODS',
  'FREEZE_DRIED',
]

export const UNITS: Unit[] = ['LITERS', 'KG', 'CANS', 'PIECES', 'GRAMS']

export interface Product {
  id: number
  name: string
  category: Category
  unit: Unit
  targetQuantity: number
  currentStock: number
  notes: string | null
}

export interface StockEntry {
  id: number
  productId: number
  quantity: number
  purchasedDate: string
  expiryDate: string
  location: string | null
  notes: string | null
  recommendedAction: string | null
}

export interface ProductPayload {
  name: string
  category: Category
  unit: Unit
  targetQuantity: number
  notes?: string | null
}

export interface StockEntryPayload {
  quantity: number
  purchasedDate: string
  expiryDate: string
  location?: string | null
  notes?: string | null
}
