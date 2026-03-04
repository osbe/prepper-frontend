export type Category =
  | 'WATER'
  | 'PRESERVED_FOOD'
  | 'DRY_GOODS'
  | 'FREEZE_DRIED'
  | 'STAPLES'
  | 'MEDICINE'
  | 'FUEL'
  | 'OTHER'

export type Unit = 'LITERS' | 'KG' | 'CANS' | 'PIECES' | 'GRAMS'


export const CATEGORIES: Category[] = [
  'WATER',
  'PRESERVED_FOOD',
  'DRY_GOODS',
  'FREEZE_DRIED',
  'STAPLES',
  'MEDICINE',
  'FUEL',
  'OTHER',
]

export const FOOD_CATEGORIES: Category[] = [
  'PRESERVED_FOOD',
  'DRY_GOODS',
  'FREEZE_DRIED',
  'STAPLES',
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
  subType: string | null
  purchasedDate: string | null
  expiryDate: string | null
  location: string | null
  notes: string | null
  expiryStatus: 'APPROACHING' | 'EXPIRED' | null
}

export interface ProductPayload {
  name: string
  category: Category
  unit: Unit
  targetQuantity: number
  notes?: string | null
}

export const NO_EXPIRY_DATE = '9999-12-31'

export interface StockEntryPayload {
  quantity: number
  subType?: string | null
  purchasedDate?: string | null
  expiryDate?: string | null
  location?: string | null
  notes?: string | null
}
