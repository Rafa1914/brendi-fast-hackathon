import { StoreService } from "../service/store";
import { Request, Response } from "express";
import { StoreValidator } from "../validator/store";
import { logger } from "../utils/logger";

async function getStore(req: Request, res: Response) {
  const parsedParams = StoreValidator.getStoreSchema.params.safeParse(req.params);
  if (!parsedParams.success) {
    logger.warn('Validação falhou ao buscar loja', {
      context: 'StoreController',
      metadata: { error: parsedParams.error.message },
    });
    return res.status(400).json({ error: parsedParams.error.message });
  }
  try {
    logger.debug('Buscando loja', {
      context: 'StoreController',
      metadata: { storeId: parsedParams.data.id },
    });
    const store = await StoreService.getStore(parsedParams.data.id);
    logger.info('Loja encontrada com sucesso', { context: 'StoreController' });
    return res.json(store);
  } catch (error) {
    logger.error('Erro ao buscar loja', error, { context: 'StoreController' });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const StoreController = {
  getStore,
};