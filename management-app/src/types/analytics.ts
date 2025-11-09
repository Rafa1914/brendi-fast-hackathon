import type { Order } from './order';

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
}

export interface PeriodDistribution {
  label: string;
  count: number;
  revenue: number;
}

export interface AnalyticsResponse {
  stats: OrderStats;
  ordersByDay: OrdersByDay[];
  ordersByWeek: OrdersByWeek[];
  topProducts: ProductAnalysis[];
  periodDistribution: PeriodDistribution[];
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
