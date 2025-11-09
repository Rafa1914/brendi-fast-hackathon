import { Feedback, FeedbackFilters } from "../../../../types/feedback";

const filterFeedbacks = (feedbacks: Feedback[], filters: FeedbackFilters): Feedback[] => {
  let filtered = feedbacks;

  if (filters.orderId && filters.orderId.length > 0) {
    filtered = filtered.filter((feedback) => 
      filters.orderId!.includes(feedback.orderId)
    );
  }

  return filtered;
};

export const FeedbackUtils = {
  filterFeedbacks,
};

