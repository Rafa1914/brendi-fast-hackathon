import z from 'zod';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const chatSchema = {
  body: z.object({
    messages: z.array(chatMessageSchema).min(1),
    analytics: z.any().optional(),
  }),
};

const dateRangeSchema = z.object({
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
}).optional();

const insightsSchema = {
  body: z.object({
    filters: z.object({
      dateRange: dateRangeSchema,
    }).optional(),
  }),
};

export const AgentValidator = {
  chatSchema,
  insightsSchema,
};

