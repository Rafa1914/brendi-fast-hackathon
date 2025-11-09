import { Router } from "express";
import { AnalyticsController } from "../controller/analytics";

const AnalyticsRouter = Router();

AnalyticsRouter.get("/", AnalyticsController.getAnalytics);

export default AnalyticsRouter;

