export interface Order {
  id: string;
  type: OrderType;
  customer: OrderCustomer;
  totalPrice: number;
  products: OrderProduct[];
  createdAt: Date;
}

export interface OrderProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface OrderFilters {
    dateRange?: {
        startDate?: Date;
        endDate?: Date;
    };
}

export interface OrderCustomer {
    name: string;
    phone: string;
}

export enum OrderType {
    DELIVERY = 'delivery',
    PICKUP = 'pickup',
    OTHER = 'other',
}