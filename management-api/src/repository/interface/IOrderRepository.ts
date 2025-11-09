import { Order, OrderFilters } from "../../types/order";

export interface IOrderRepository {
  listOrders(filters: OrderFilters): Promise<Order[]>;
}

