export interface Feedback {
  id: string
  storeConsumerId: string
  createdAt: string
  updatedAt: string
  category: string
  orderId: string
  ratedResponse: string
  rating: number
  storeId: string
}

export interface FeedbackFilters {
  orderId?: string[]
}

export interface FeedbackStats {
  totalFeedbacks: number
  averageRating: number
  positiveFeedbacks: number
  negativeFeedbacks: number
  neutralFeedbacks: number
}

export interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

export interface CategoryDistribution {
  category: string
  categoryLabel: string
  count: number
  percentage: number
}

export interface TopCustomer {
  storeConsumerId: string
  customerName: string
  customerPhone: string
  totalFeedbacks: number
  averageRating: number
  totalOrders: number
}

export interface FeedbackAnalyticsResponse {
  stats: FeedbackStats
  ratingDistribution: RatingDistribution[]
  categoryDistribution: CategoryDistribution[]
  topCustomers: TopCustomer[]
  recentFeedbacks: Feedback[]
  periodInfo: {
    startDate: string
    endDate: string
    totalFeedbacks: number
  }
}

export interface FeedbackAnalyticsFilters {
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}
