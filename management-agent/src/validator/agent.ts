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

const insightsSchema = {
  body: z.object({
    analytics: z.any(),
    period: z.string().optional(),
  }),
};

export const AgentValidator = {
  chatSchema,
  insightsSchema,
};

