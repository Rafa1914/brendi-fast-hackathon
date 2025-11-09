
import z from 'zod';

const listOrdersSchema = {
    query: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }).transform((data) => {
        const filters: {
            dateRange?: {
                startDate?: Date;
                endDate?: Date;
            };
        } = {};

        if (data.startDate || data.endDate) {
            filters.dateRange = {
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            };
        }

        return filters;
    }),
};

export const OrderValidator = {
  listOrdersSchema,
};

