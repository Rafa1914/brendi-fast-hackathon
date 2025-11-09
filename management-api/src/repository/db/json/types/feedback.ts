export interface FeedbackJson {
  id: string;
  store_consumer_id: string;
  created_at: FeedbackTimestampJson;
  updated_at: FeedbackTimestampJson;
  category: string;
  order_id: string;
  rated_response: string;
  rating: number;
  store_id: string;
}

export interface FeedbackTimestampJson {
  _date: boolean;
  iso: string;
}

