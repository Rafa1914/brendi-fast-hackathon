import { Feedback } from "../../../../types/feedback";
import { FeedbackJson } from "../types/feedback";

export const adaptFeedbackFromJson = (feedbackJson: FeedbackJson): Feedback => {
  // Converter created_at
  let createdAt: Date;
  if (feedbackJson.created_at.iso) {
    createdAt = new Date(feedbackJson.created_at.iso);
  } else {
    createdAt = new Date();
  }

  // Converter updated_at
  let updatedAt: Date;
  if (feedbackJson.updated_at.iso) {
    updatedAt = new Date(feedbackJson.updated_at.iso);
  } else {
    updatedAt = new Date();
  }

  return {
    id: feedbackJson.id,
    storeConsumerId: feedbackJson.store_consumer_id,
    createdAt,
    updatedAt,
    category: feedbackJson.category,
    orderId: feedbackJson.order_id,
    ratedResponse: feedbackJson.rated_response,
    rating: feedbackJson.rating,
    storeId: feedbackJson.store_id,
  };
};

