import { OrderService } from "../service/order";
import { Request, Response } from "express";
import { OrderValidator } from "../validator/order";
import { logger } from "../utils/logger";

async function listOrders(req: Request, res: Response) {
  const parsedQuery = OrderValidator.listOrdersSchema.query.safeParse(req.query);
  if (!parsedQuery.success) {
    logger.warn('Validação falhou ao listar pedidos', {
      context: 'OrderController',
      metadata: { error: parsedQuery.error.message },
    });
    return res.status(400).json({ error: parsedQuery.error.message });
  }
  try {
    logger.debug('Listando pedidos', {
      context: 'OrderController',
      metadata: { query: parsedQuery.data },
    });
    const orders = await OrderService.listOrders(parsedQuery.data);
    logger.info('Pedidos listados com sucesso', {
      context: 'OrderController',
      metadata: { count: orders.length },
    });
    return res.json(orders);
  } catch (error) {
    logger.error('Erro ao listar pedidos', error, { context: 'OrderController' });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const OrderController = {
  listOrders,
};

