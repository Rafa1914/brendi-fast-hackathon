import OrderRepository from "../repository/order";
import { Order, OrderFilters } from "../types/order";
import { logger } from "../utils/logger";

async function listOrders(filters: OrderFilters): Promise<Order[]> {
  logger.debug('Listando pedidos no serviço', {
    context: 'OrderService',
    metadata: { filters },
  });
  return await OrderRepository.listOrders(filters);
}

export const OrderService = {
  listOrders,
};

