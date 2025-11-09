import { StoreService } from "../service/store";
import { Request, Response } from "express";
import { StoreValidator } from "../validator/store";

async function getStore(req: Request, res: Response) {
  const parsedParams = StoreValidator.getStoreSchema.params.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: parsedParams.error.message });
  }
  try {
    const store = await StoreService.getStore(parsedParams.data.id);
    return res.json(store);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const StoreController = {
  getStore,
};