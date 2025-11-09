import { Router } from "express";
import { FeedbackController } from "../controller/feedback";

const FeedbackRouter = Router();

FeedbackRouter.get('/analytics', FeedbackController.getFeedbackAnalytics);

export default FeedbackRouter;

