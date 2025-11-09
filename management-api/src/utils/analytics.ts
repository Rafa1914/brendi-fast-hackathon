import { Order, OrderType } from "../types/order";
import {
  OrderStats,
  OrdersByDay,
  OrdersByWeek,
  ProductAnalysis,
  PeriodDistribution,
  OrderTypeDistribution,
  LoyalCustomer,
  PreparationTimeStats,
  NeighborhoodDistribution,
} from "../types/analytics";

function getWeekLabel(date: Date): string {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const startStr = startOfWeek.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const endStr = endOfWeek.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return `${startStr} - ${endStr}`;
}

function calculateStats(orders: Order[]): OrderStats {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
  };
}

function groupOrdersByDay(orders: Order[]): OrdersByDay[] {
  const ordersByDayMap = new Map<
    string,
    { count: number; revenue: number }
  >();

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const dayKey = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const existing = ordersByDayMap.get(dayKey) || {
      count: 0,
      revenue: 0,
    };
    existing.count++;
    existing.revenue += order.totalPrice;
    ordersByDayMap.set(dayKey, existing);
  });

  const sortedDays = Array.from(ordersByDayMap.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort(
      (a, b) =>
        new Date(a.date.split("/").reverse().join("-")).getTime() -
        new Date(b.date.split("/").reverse().join("-")).getTime()
    );

  return sortedDays;
}

function groupOrdersByWeek(orders: Order[]): OrdersByWeek[] {
  const ordersByWeekMap = new Map<
    string,
    { count: number; revenue: number; startDate: Date }
  >();

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const weekKey = getWeekLabel(date);

    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const existing = ordersByWeekMap.get(weekKey) || {
      count: 0,
      revenue: 0,
      startDate: startOfWeek,
    };
    existing.count++;
    existing.revenue += order.totalPrice;
    ordersByWeekMap.set(weekKey, existing);
  });

  const sortedWeeks = Array.from(ordersByWeekMap.entries())
    .map(([week, data]) => ({
      week,
      startDate: data.startDate.toLocaleDateString("pt-BR"),
      endDate: new Date(
        data.startDate.getTime() + 6 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("pt-BR"),
      count: data.count,
      revenue: data.revenue,
    }))
    .sort(
      (a, b) =>
        new Date(a.startDate.split("/").reverse().join("-")).getTime() -
        new Date(b.startDate.split("/").reverse().join("-")).getTime()
    );

  return sortedWeeks;
}

function analyzeProducts(orders: Order[]): ProductAnalysis[] {
  const productMap = new Map<
    string,
    { id: string; name: string; totalQuantity: number; totalRevenue: number }
  >();

  orders.forEach((order) => {
    order.products.forEach((product) => {
      const existing = productMap.get(product.id) || {
        id: product.id,
        name: product.name,
        totalQuantity: 0,
        totalRevenue: 0,
      };

      existing.totalQuantity += product.quantity;
      existing.totalRevenue += product.price * product.quantity;

      productMap.set(product.id, existing);
    });
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  
  return Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
    .map((product) => ({
      ...product,
      revenuePercentage: totalRevenue > 0 ? (product.totalRevenue / totalRevenue) * 100 : 0,
    }));
}

function calculatePeriodDistribution(orders: Order[]): PeriodDistribution[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const periods: PeriodDistribution[] = [
    { label: "Hoje", count: 0, revenue: 0 },
    { label: "Ontem", count: 0, revenue: 0 },
    { label: "Última Semana", count: 0, revenue: 0 },
    { label: "Último Mês", count: 0, revenue: 0 },
  ];

  const periodRanges = [
    {
      start: today,
      end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
    { start: yesterday, end: today },
    { start: lastWeek, end: today },
    { start: lastMonth, end: today },
  ];

  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);

    periodRanges.forEach((range, index) => {
      if (orderDate >= range.start && orderDate < range.end) {
        periods[index].count++;
        periods[index].revenue += order.totalPrice;
      }
    });
  });

  return periods;
}

function getRecentOrders(orders: Order[], limit: number = 6): Order[] {
  return orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

function getPeriodInfo(orders: Order[]): {
  startDate: string;
  endDate: string;
  totalOrders: number;
} {
  if (orders.length === 0) {
    return {
      startDate: "",
      endDate: "",
      totalOrders: 0,
    };
  }

  const dates = orders
    .map((order) => new Date(order.createdAt))
    .sort((a, b) => a.getTime() - b.getTime());

  const startDate = dates[0].toLocaleDateString("pt-BR");
  const endDate = dates[dates.length - 1].toLocaleDateString("pt-BR");

  return {
    startDate,
    endDate,
    totalOrders: orders.length,
  };
}

function calculateOrderTypeDistribution(orders: Order[]): OrderTypeDistribution[] {
  const typeMap = new Map<
    OrderType,
    { count: number; revenue: number }
  >();

  orders.forEach((order) => {
    const existing = typeMap.get(order.type) || {
      count: 0,
      revenue: 0,
    };
    existing.count++;
    existing.revenue += order.totalPrice;
    typeMap.set(order.type, existing);
  });

  const totalOrders = orders.length;

  const typeLabels: Record<OrderType, string> = {
    [OrderType.DELIVERY]: "Delivery",
    [OrderType.PICKUP]: "Retirada",
    [OrderType.OTHER]: "Outro",
  };

  return Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    label: typeLabels[type],
    count: data.count,
    revenue: data.revenue,
    percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
  }));
}

function analyzeLoyalCustomers(orders: Order[]): LoyalCustomer[] {
  const customerMap = new Map<
    string,
    {
      customer: { name: string; phone: string };
      orders: number[];
      totalRevenue: number;
    }
  >();

  orders.forEach((order) => {
    const customerKey = `${order.customer.phone}`;
    const existing = customerMap.get(customerKey) || {
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
      },
      orders: [],
      totalRevenue: 0,
    };

    existing.orders.push(order.totalPrice);
    existing.totalRevenue += order.totalPrice;
    customerMap.set(customerKey, existing);
  });

  return Array.from(customerMap.values())
    .map((data) => ({
      customer: data.customer,
      totalOrders: data.orders.length,
      totalRevenue: data.totalRevenue,
      averageTicket: data.orders.length > 0
        ? data.totalRevenue / data.orders.length
        : 0,
    }))
    .sort((a, b) => {
      // Ordenar por total de pedidos primeiro, depois por receita total
      if (b.totalOrders !== a.totalOrders) {
        return b.totalOrders - a.totalOrders;
      }
      return b.totalRevenue - a.totalRevenue;
    })
    .slice(0, 5);
}

function calculatePreparationTimeStats(orders: Order[]): PreparationTimeStats | undefined {
  const ordersWithTimes = orders.filter((order) => order.elapsedTimes !== undefined);
  
  if (ordersWithTimes.length === 0) {
    return undefined;
  }

  let totalTimeToConfirm = 0;
  let totalTimeToReady = 0;
  let totalTimeToTransit = 0;
  let totalTimeToDelivered = 0;

  ordersWithTimes.forEach((order) => {
    if (order.elapsedTimes && order.elapsedTimes.timeToConfirm && order.elapsedTimes.timeToReady && order.elapsedTimes.timeToTransit && order.elapsedTimes.timeToDelivered) {
      totalTimeToConfirm += order.elapsedTimes.timeToConfirm;
      totalTimeToReady += order.elapsedTimes.timeToReady;
      totalTimeToTransit += order.elapsedTimes.timeToTransit;
      totalTimeToDelivered += order.elapsedTimes.timeToDelivered;
    }
  });

  const count = ordersWithTimes.length;
  const averageTimeToConfirm = totalTimeToConfirm / count;
  const averageTimeToReady = totalTimeToReady / count;
  const averageTimeToTransit = totalTimeToTransit / count;
  const averageTimeToDelivered = totalTimeToDelivered / count;
  const totalTimeAverage = averageTimeToConfirm + averageTimeToReady + averageTimeToTransit + averageTimeToDelivered;

  return {
    averageTimeToConfirm,
    averageTimeToReady,
    averageTimeToTransit,
    averageTimeToDelivered,
    totalTimeAverage,
    ordersWithData: count,
    ordersWithoutData: orders.length - count,
  };
}

function calculateNeighborhoodDistribution(orders: Order[]): NeighborhoodDistribution[] {
  // Filtrar apenas pedidos entregues (status === 'delivered')
  const deliveredOrders = orders.filter(
    (order) => order.status === 'delivered' && order.neighborhood
  );

  if (deliveredOrders.length === 0) {
    return [];
  }

  const neighborhoodMap = new Map<
    string,
    { count: number; revenue: number }
  >();

  deliveredOrders.forEach((order) => {
    const neighborhood = order.neighborhood!;
    const existing = neighborhoodMap.get(neighborhood) || {
      count: 0,
      revenue: 0,
    };
    existing.count++;
    existing.revenue += order.totalPrice;
    neighborhoodMap.set(neighborhood, existing);
  });

  const totalOrders = deliveredOrders.length;

  return Array.from(neighborhoodMap.entries())
    .map(([neighborhood, data]) => ({
      neighborhood,
      count: data.count,
      revenue: data.revenue,
      percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export const AnalyticsUtils = {
  getWeekLabel,
  calculateStats,
  groupOrdersByDay,
  groupOrdersByWeek,
  analyzeProducts,
  calculatePeriodDistribution,
  getRecentOrders,
  getPeriodInfo,
  calculateOrderTypeDistribution,
  analyzeLoyalCustomers,
  calculatePreparationTimeStats,
  calculateNeighborhoodDistribution,
};

