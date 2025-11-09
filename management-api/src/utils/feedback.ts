import { Feedback } from "../types/feedback";
import {
  FeedbackStats,
  RatingDistribution,
  CategoryDistribution,
  TopCustomer,
  FeedbackAnalyticsResponse,
  FeedbackAnalyticsFilters,
} from "../types/feedback";
import OrderRepository from "../repository/order";
import FeedbackRepository from "../repository/feedback";
import { OrderFilters } from "../types/order";
import { FeedbackFilters } from "../types/feedback";

const CATEGORY_LABELS: Record<string, string> = {
  "delivery-speed": "Velocidade de Entrega",
  "delivery-experience": "Experiência de Entrega",
  "overall-experience": "Experiência Geral",
  "food-quality": "Qualidade da Comida",
  "service": "Atendimento",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

function calculateStats(feedbacks: Feedback[]): FeedbackStats {
  const totalFeedbacks = feedbacks.length;
  
  if (totalFeedbacks === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      positiveFeedbacks: 0,
      negativeFeedbacks: 0,
      neutralFeedbacks: 0,
    };
  }

  const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = totalRating / totalFeedbacks;

  const positiveFeedbacks = feedbacks.filter((f) => f.rating >= 4).length;
  const negativeFeedbacks = feedbacks.filter((f) => f.rating <= 2).length;
  const neutralFeedbacks = feedbacks.filter((f) => f.rating === 3).length;

  return {
    totalFeedbacks,
    averageRating,
    positiveFeedbacks,
    negativeFeedbacks,
    neutralFeedbacks,
  };
}

function calculateRatingDistribution(feedbacks: Feedback[]): RatingDistribution[] {
  if (feedbacks.length === 0) {
    return [];
  }

  const ratingMap = new Map<number, number>();
  feedbacks.forEach((f) => {
    ratingMap.set(f.rating, (ratingMap.get(f.rating) || 0) + 1);
  });

  const total = feedbacks.length;

  return Array.from(ratingMap.entries())
    .map(([rating, count]) => ({
      rating,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.rating - a.rating);
}

function calculateCategoryDistribution(
  feedbacks: Feedback[]
): CategoryDistribution[] {
  if (feedbacks.length === 0) {
    return [];
  }

  const categoryMap = new Map<string, number>();
  feedbacks.forEach((f) => {
    categoryMap.set(f.category, (categoryMap.get(f.category) || 0) + 1);
  });

  const total = feedbacks.length;

  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      categoryLabel: getCategoryLabel(category),
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

async function analyzeTopCustomers(
  feedbacks: Feedback[],
  orderFilters: OrderFilters
): Promise<TopCustomer[]> {
  if (feedbacks.length === 0) {
    return [];
  }

  // Buscar pedidos do período para obter informações dos clientes
  const orders = await OrderRepository.listOrders(orderFilters);

  // Criar mapa de pedidos por ID para busca rápida
  const ordersMap = new Map(orders.map((o) => [o.id, o]));

  // Agrupar feedbacks por cliente
  const customerMap = new Map<
    string,
    {
      storeConsumerId: string;
      feedbacks: Feedback[];
      orderIds: Set<string>;
    }
  >();

  feedbacks.forEach((feedback) => {
    const existing = customerMap.get(feedback.storeConsumerId);
    if (existing) {
      existing.feedbacks.push(feedback);
      existing.orderIds.add(feedback.orderId);
    } else {
      customerMap.set(feedback.storeConsumerId, {
        storeConsumerId: feedback.storeConsumerId,
        feedbacks: [feedback],
        orderIds: new Set([feedback.orderId]),
      });
    }
  });

  // Calcular estatísticas por cliente
  const topCustomers: TopCustomer[] = Array.from(customerMap.values())
    .map((customer) => {
      const totalFeedbacks = customer.feedbacks.length;
      const totalRating = customer.feedbacks.reduce(
        (sum, f) => sum + f.rating,
        0
      );
      const averageRating = totalRating / totalFeedbacks;
      const totalOrders = customer.orderIds.size;

      // Tentar obter informações do cliente do primeiro pedido
      const firstOrderId = Array.from(customer.orderIds)[0];
      const firstOrder = ordersMap.get(firstOrderId);
      const customerName = firstOrder?.customer?.name || `Cliente ${customer.storeConsumerId}`;
      const customerPhone = firstOrder?.customer?.phone || "";

      return {
        storeConsumerId: customer.storeConsumerId,
        customerName,
        customerPhone,
        totalFeedbacks,
        averageRating,
        totalOrders,
      };
    })
    .sort((a, b) => {
      // Ordenar por total de feedbacks, depois por rating médio
      if (b.totalFeedbacks !== a.totalFeedbacks) {
        return b.totalFeedbacks - a.totalFeedbacks;
      }
      return b.averageRating - a.averageRating;
    })
    .slice(0, 10); // Top 10

  return topCustomers;
}

function getRecentFeedbacks(feedbacks: Feedback[]): Feedback[] {
  return [...feedbacks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 50); // Últimos 50 feedbacks
}

function getPeriodInfo(feedbacks: Feedback[]): {
  startDate: string;
  endDate: string;
  totalFeedbacks: number;
} {
  if (feedbacks.length === 0) {
    return {
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      totalFeedbacks: 0,
    };
  }

  const dates = feedbacks.map((f) => new Date(f.createdAt));
  const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalFeedbacks: feedbacks.length,
  };
}

export async function getFeedbackAnalytics(
  filters: FeedbackAnalyticsFilters
): Promise<FeedbackAnalyticsResponse> {
  // Primeiro, buscar os pedidos do período
  const orderFilters: OrderFilters = {
    dateRange: filters.dateRange,
  };

  const orders = await OrderRepository.listOrders(orderFilters);

  if (orders.length === 0) {
    return {
      stats: {
        totalFeedbacks: 0,
        averageRating: 0,
        positiveFeedbacks: 0,
        negativeFeedbacks: 0,
        neutralFeedbacks: 0,
      },
      ratingDistribution: [],
      categoryDistribution: [],
      topCustomers: [],
      recentFeedbacks: [],
      periodInfo: {
        startDate: filters.dateRange?.startDate?.toISOString() || new Date().toISOString(),
        endDate: filters.dateRange?.endDate?.toISOString() || new Date().toISOString(),
        totalFeedbacks: 0,
      },
    };
  }

  // Extrair os IDs dos pedidos
  const orderIds = orders.map((order) => order.id);

  // Buscar feedbacks relacionados aos pedidos
  const feedbackFilters: FeedbackFilters = {
    orderId: orderIds,
  };

  const feedbacks = await FeedbackRepository.listFeedbacks(feedbackFilters);

  // Processar os dados
  const stats = calculateStats(feedbacks);
  const ratingDistribution = calculateRatingDistribution(feedbacks);
  const categoryDistribution = calculateCategoryDistribution(feedbacks);
  const topCustomers = await analyzeTopCustomers(feedbacks, orderFilters);
  const recentFeedbacks = getRecentFeedbacks(feedbacks);
  const periodInfo = getPeriodInfo(feedbacks);

  return {
    stats,
    ratingDistribution,
    categoryDistribution,
    topCustomers,
    recentFeedbacks,
    periodInfo,
  };
}

export const FeedbackUtils = {
  calculateStats,
  calculateRatingDistribution,
  calculateCategoryDistribution,
  analyzeTopCustomers,
  getRecentFeedbacks,
  getPeriodInfo,
  getFeedbackAnalytics,
};

