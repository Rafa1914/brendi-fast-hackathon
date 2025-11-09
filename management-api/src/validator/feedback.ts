import z from 'zod';
import { FeedbackFilters, FeedbackAnalyticsFilters } from '../types/feedback';

const listFeedbacksSchema = {
  query: z.object({
    orderId: z.string().optional().transform((val) => {
      if (!val) return undefined;
      // Se for uma string, pode ser um array separado por vírgula ou um único ID
      return val.split(',').filter(Boolean);
    }),
  }).transform((data) => {
    const filters: FeedbackFilters = {};

    if (data.orderId && data.orderId.length > 0) {
      filters.orderId = data.orderId;
    }

    return filters;
  }),
};

const getFeedbackAnalyticsSchema = {
  query: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .transform((data) => {
      const filters: FeedbackAnalyticsFilters = {};

      if (data.startDate || data.endDate) {
        filters.dateRange = {
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        };
      }

      return filters;
    }),
};

export const FeedbackValidator = {
  listFeedbacksSchema,
  getFeedbackAnalyticsSchema,
};

