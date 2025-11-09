export interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface OrdersByDay {
  date: string;
  count: number;
  revenue: number;
}

export interface OrdersByWeek {
  week: string;
  startDate: string;
  endDate: string;
  count: number;
  revenue: number;
}

export interface ProductAnalysis {
  id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  revenuePercentage?: number;
}

export interface PeriodDistribution {
  label: string;
  count: number;
  revenue: number;
}

export enum OrderType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  OTHER = 'other',
}

export interface OrderTypeDistribution {
  type: OrderType;
  label: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface LoyalCustomer {
  customer: {
    name: string;
    phone: string;
  };
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface PreparationTimeStats {
  averageTimeToConfirm: number;
  averageTimeToReady: number;
  averageTimeToTransit: number;
  averageTimeToDelivered: number;
  totalTimeAverage: number;
  ordersWithData: number;
  ordersWithoutData: number;
}

export interface NeighborhoodDistribution {
  neighborhood: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface AnalyticsResponse {
  stats: OrderStats;
  ordersByDay: OrdersByDay[];
  ordersByWeek: OrdersByWeek[];
  topProducts: ProductAnalysis[];
  periodDistribution: PeriodDistribution[];
  orderTypeDistribution: OrderTypeDistribution[];
  loyalCustomers: LoyalCustomer[];
  recentOrders: any[];
  periodInfo: {
    startDate: string;
    endDate: string;
    totalOrders: number;
  };
  preparationTimeStats?: PreparationTimeStats;
  neighborhoodDistribution: NeighborhoodDistribution[];
}

export interface AnalyticsFilters {
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

