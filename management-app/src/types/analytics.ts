import type { Order, OrderType } from './order';

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

export interface AnalyticsResponse {
  stats: OrderStats;
  ordersByDay: OrdersByDay[];
  ordersByWeek: OrdersByWeek[];
  topProducts: ProductAnalysis[];
  periodDistribution: PeriodDistribution[];
  orderTypeDistribution: OrderTypeDistribution[];
  loyalCustomers: LoyalCustomer[];
  recentOrders: Order[];
  periodInfo: {
    startDate: string;
    endDate: string;
    totalOrders: number;
  };
}

export interface AnalyticsFilters {
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}
