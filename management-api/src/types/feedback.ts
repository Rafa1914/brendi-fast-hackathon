export interface Feedback {
  id: string;
  storeConsumerId: string;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  orderId: string;
  ratedResponse: string;
  rating: number;
  storeId: string;
}

export interface FeedbackFilters {
  orderId?: string[];
}

