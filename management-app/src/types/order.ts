export interface Order {
  id: string
  type: OrderType
  customer: OrderCustomer
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

export interface OrderCustomer {
  name: string
  phone: string
}

export interface OrderFilters {
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}

export enum OrderType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  OTHER = 'other',
}

