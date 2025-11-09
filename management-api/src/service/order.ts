import OrderRepository from "../repository/order";
import { Order, OrderFilters } from "../types/order";

async function listOrders(filters: OrderFilters): Promise<Order[]> {
  console.log('listOrders', filters);
  return await OrderRepository.listOrders(filters);
}

export const OrderService = {
  listOrders,
};

