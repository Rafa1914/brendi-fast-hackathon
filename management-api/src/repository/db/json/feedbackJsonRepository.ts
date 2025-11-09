import { IFeedbackRepository } from "../../interface/IFeedbackRepository";
import { Feedback, FeedbackFilters } from "../../../types/feedback";
import * as fs from 'fs/promises';
import * as path from 'path';
import { adaptFeedbackFromJson } from "./adapters/feedback";
import { FeedbackJson } from "./types/feedback";
import { FeedbackUtils } from "./utils/feedback";



export const FeedbackJsonRepository: IFeedbackRepository = {
  listFeedbacks: async (filters: FeedbackFilters): Promise<Feedback[]> => {
    const filePath = path.join(__dirname, '../../data/feedbacks.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const feedbacksJson = JSON.parse(fileContent) as FeedbackJson[];
    const feedbacks = feedbacksJson.map(adaptFeedbackFromJson);
    
    return FeedbackUtils.filterFeedbacks(feedbacks, filters);
  }
};

