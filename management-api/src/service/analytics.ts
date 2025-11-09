import OrderRepository from "../repository/order";
import { OrderFilters } from "../types/order";
import {
  AnalyticsResponse,
  AnalyticsFilters,
} from "../types/analytics";
import { AnalyticsUtils } from "../utils/analytics";

async function getAnalytics(
  filters: AnalyticsFilters
): Promise<AnalyticsResponse> {
  const orderFilters: OrderFilters = {
    dateRange: filters.dateRange,
  };

  const orders = await OrderRepository.listOrders(orderFilters);

  const stats = AnalyticsUtils.calculateStats(orders);
  const ordersByDay = AnalyticsUtils.groupOrdersByDay(orders);
  const ordersByWeek = AnalyticsUtils.groupOrdersByWeek(orders);
  const topProducts = AnalyticsUtils.analyzeProducts(orders);
  const periodDistribution = AnalyticsUtils.calculatePeriodDistribution(orders);
  const orderTypeDistribution = AnalyticsUtils.calculateOrderTypeDistribution(orders);
  const loyalCustomers = AnalyticsUtils.analyzeLoyalCustomers(orders);
  const recentOrders = AnalyticsUtils.getRecentOrders(orders);
  const periodInfo = AnalyticsUtils.getPeriodInfo(orders);
  const preparationTimeStats = AnalyticsUtils.calculatePreparationTimeStats(orders);

  return {
    stats,
    ordersByDay,
    ordersByWeek,
    topProducts,
    periodDistribution,
    orderTypeDistribution,
    loyalCustomers,
    recentOrders,
    periodInfo,
    preparationTimeStats,
  };
}

export const AnalyticsService = {
  getAnalytics,
};

