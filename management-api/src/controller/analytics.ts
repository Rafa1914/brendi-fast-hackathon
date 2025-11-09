import { AnalyticsService } from "../service/analytics";
import { Request, Response } from "express";
import { AnalyticsValidator } from "../validator/analytics";
import { logger } from "../utils/logger";

async function getAnalytics(req: Request, res: Response) {
  const parsedQuery =
    AnalyticsValidator.getAnalyticsSchema.query.safeParse(req.query);
  if (!parsedQuery.success) {
    logger.warn('Validação falhou ao buscar analytics', {
      context: 'AnalyticsController',
      metadata: { error: parsedQuery.error.message },
    });
    return res.status(400).json({ error: parsedQuery.error.message });
  }
  try {
    logger.debug('Buscando analytics', {
      context: 'AnalyticsController',
      metadata: { query: parsedQuery.data },
    });
    const analytics = await AnalyticsService.getAnalytics(parsedQuery.data);
    logger.info('Analytics buscados com sucesso', { context: 'AnalyticsController' });
    return res.json(analytics);
  } catch (error) {
    logger.error('Erro ao buscar analytics', error, { context: 'AnalyticsController' });
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const AnalyticsController = {
  getAnalytics,
};

