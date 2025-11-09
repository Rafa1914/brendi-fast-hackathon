export interface Order {
  id: string
  totalPrice: number
  products: OrderProduct[]
  createdAt: string
}

export interface OrderProduct {
  id: string
  name: string
  price: number
  quantity: number
}

export interface OrderFilters {
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}

