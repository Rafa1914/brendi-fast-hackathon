import { Feedback, FeedbackFilters } from "../../types/feedback";

export interface IFeedbackRepository {
  listFeedbacks(filters: FeedbackFilters): Promise<Feedback[]>;
}

