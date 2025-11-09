import { IOrderRepository } from "../../interface/IOrderRepository";
import { Order, OrderFilters } from "../../../types/order";
import * as path from 'path';
import { adaptOrderFromJson } from "./adapters/order";
import { OrderJson } from "./types/order";
import { OrderUtils } from "./utils/order";
import { readJsonArrayStream } from "./utils/jsonStreamReader";



export const OrderJsonRepository: IOrderRepository = {
  listOrders: async (filters: OrderFilters): Promise<Order[]> => {
    const filePath = path.join(__dirname, '../../data/orders.json');
    const orders = await readJsonArrayStream<OrderJson, Order>(
      filePath,
      adaptOrderFromJson,
      (error, item, index) => {
        console.error(`Erro ao processar order no índice ${index}:`, error);
        console.error('Item que causou o erro:', JSON.stringify(item, null, 2));
      },
      (error) => {
        console.error('Erro no parser do JSON ao processar orders:', error);
        console.error('Retornando orders processados até o momento do erro');
      }
    );
    
    return OrderUtils.filterOrders(orders, filters);
  }
};

