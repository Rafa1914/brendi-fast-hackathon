
import { FeedbackJsonRepository } from "./db/json/feedbackJsonRepository";
import { IFeedbackRepository } from "./interface/IFeedbackRepository";

const FeedbackRepository: IFeedbackRepository = FeedbackJsonRepository;

export default FeedbackRepository;

