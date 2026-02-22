export type Category =
  | 'WATER'
  | 'PRESERVED_FOOD'
  | 'DRY_GOODS'
  | 'FREEZE_DRIED'
  | 'MEDICINE'
  | 'FUEL'
  | 'OTHER'

export type Unit = 'LITERS' | 'KG' | 'CANS' | 'PIECES' | 'GRAMS'

export const CATEGORY_LABELS: Record<Category, string> = {
  WATER: 'Water',
  PRESERVED_FOOD: 'Preserved Food',
  DRY_GOODS: 'Dry Goods',
  FREEZE_DRIED: 'Freeze-Dried',
  MEDICINE: 'Medicine',
  FUEL: 'Fuel',
  OTHER: 'Other',
}

export const UNIT_LABELS: Record<Unit, string> = {
  LITERS: 'L',
  KG: 'kg',
  CANS: 'cans',
  PIECES: 'pcs',
  GRAMS: 'g',
}

export const CATEGORIES: Category[] = [
  'WATER',
  'PRESERVED_FOOD',
  'DRY_GOODS',
  'FREEZE_DRIED',
  'MEDICINE',
  'FUEL',
  'OTHER',
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
