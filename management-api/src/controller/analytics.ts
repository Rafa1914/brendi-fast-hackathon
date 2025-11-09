import { AnalyticsService } from "../service/analytics";
import { Request, Response } from "express";
import { AnalyticsValidator } from "../validator/analytics";

async function getAnalytics(req: Request, res: Response) {
  const parsedQuery =
    AnalyticsValidator.getAnalyticsSchema.query.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: parsedQuery.error.message });
  }
  try {
    const analytics = await AnalyticsService.getAnalytics(parsedQuery.data);
    return res.json(analytics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const AnalyticsController = {
  getAnalytics,
};

