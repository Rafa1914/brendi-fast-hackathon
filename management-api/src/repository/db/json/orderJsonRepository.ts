import { IOrderRepository } from "../../interface/IOrderRepository";
import { Order, OrderFilters } from "../../../types/order";
import * as fs from 'fs/promises';
import * as path from 'path';
import { adaptOrderFromJson } from "./adapters/order";
import { OrderJson } from "./types/order";
import { OrderUtils } from "./utils/order";



export const OrderJsonRepository: IOrderRepository = {
  listOrders: async (filters: OrderFilters): Promise<Order[]> => {
    const filePath = path.join(__dirname, '../../data/orders_minimized.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const ordersJson = JSON.parse(fileContent) as OrderJson[];
    const orders = ordersJson.map(adaptOrderFromJson);
    
    return OrderUtils.filterOrders(orders, filters);
  }
};

