import { IFeedbackRepository } from "../../interface/IFeedbackRepository";
import { Feedback, FeedbackFilters } from "../../../types/feedback";
import * as path from 'path';
import { adaptFeedbackFromJson } from "./adapters/feedback";
import { FeedbackJson } from "./types/feedback";
import { FeedbackUtils } from "./utils/feedback";
import { readJsonArrayStream } from "./utils/jsonStreamReader";



export const FeedbackJsonRepository: IFeedbackRepository = {
  listFeedbacks: async (filters: FeedbackFilters): Promise<Feedback[]> => {
    const filePath = path.join(__dirname, '../../data/feedbacks.json');
    const feedbacks = await readJsonArrayStream<FeedbackJson, Feedback>(
      filePath,
      adaptFeedbackFromJson
    );
    
    return FeedbackUtils.filterFeedbacks(feedbacks, filters);
  }
};

