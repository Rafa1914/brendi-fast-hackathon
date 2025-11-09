
import z from 'zod';

const getStoreSchema = {
    params: z.object({
        id: z.string(),
    }),
};

export const StoreValidator = {
  getStoreSchema,
};