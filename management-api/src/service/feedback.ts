import { getFeedbackAnalytics } from "../utils/feedback";
import { FeedbackAnalyticsFilters, FeedbackAnalyticsResponse } from "../types/feedback";
import { logger } from "../utils/logger";

async function getFeedbackAnalyticsService(
  filters: FeedbackAnalyticsFilters
): Promise<FeedbackAnalyticsResponse> {
  logger.debug('Processando analytics de feedbacks', {
    context: 'FeedbackService',
    metadata: { filters },
  });
  return await getFeedbackAnalytics(filters);
}

export const FeedbackService = {
  getFeedbackAnalytics: getFeedbackAnalyticsService,
};
