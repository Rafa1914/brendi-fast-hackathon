export interface Order {
  id: string;
  totalPrice: number;
  products: OrderProduct[];
  createdAt: Date;
  storeId?: string;
}

export interface OrderProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface OrderFilters {
    storeId?: string;
    dateRange?: {
        startDate?: Date;
        endDate?: Date;
    };
}