import { IOrderRepository } from "../interface/IOrderRepository";
import { Order, OrderFilters } from "../../types/order";
import * as fs from 'fs/promises';
import * as path from 'path';

interface OrderJson {
  id: string;
  totalPrice: number;
  products: OrderProductJson[];
  createdAt: CreatedAtJson | number;
  voucher?: {
    storeId?: string;
  };
}

interface OrderProductJson {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  categoryPath?: string;
}

interface CreatedAtJson {
  iso?: string;
  seconds?: number;
  _timestamp?: boolean;
}

const adaptOrderFromJson = (orderJson: OrderJson): Order => {
  // Extrair storeId do voucher ou do categoryPath dos produtos
  let storeId: string | undefined;
  if (orderJson.voucher?.storeId) {
    storeId = orderJson.voucher.storeId;
  } else if (orderJson.products && orderJson.products.length > 0) {
    const categoryPath = orderJson.products[0].categoryPath;
    if (categoryPath) {
      const match = categoryPath.match(/stores\/([^\/]+)/);
      if (match) {
        storeId = match[1];
      }
    }
  }

  // Converter createdAt
  let createdAt: Date;
  if (typeof orderJson.createdAt === 'number') {
    createdAt = new Date(orderJson.createdAt);
  } else if (orderJson.createdAt.iso) {
    createdAt = new Date(orderJson.createdAt.iso);
  } else if (orderJson.createdAt.seconds) {
    createdAt = new Date(orderJson.createdAt.seconds * 1000);
  } else {
    createdAt = new Date();
  }

  return {
    id: orderJson.id,
    totalPrice: orderJson.totalPrice,
    products: orderJson.products.map(product => ({
      id: product.productId,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    })),
    createdAt,
    storeId,
  };
};

const filterOrders = (orders: Order[], filters: OrderFilters): Order[] => {
  let filtered = orders;

  if (filters.storeId) {
    filtered = filtered.filter(order => order.storeId === filters.storeId);
  }

  if (filters.dateRange) {
    filtered = filtered.filter(order => {
      const orderDate = order.createdAt;
      const { startDate, endDate } = filters.dateRange!;
      // Both are optional, so handle presence accordingly
      if (startDate && endDate) {
        return orderDate >= startDate && orderDate <= endDate;
      } else if (startDate) {
        return orderDate >= startDate;
      } else if (endDate) {
        return orderDate <= endDate;
      }
      return true; // No filter applied if neither present
    });
  }
  return filtered;
}

export const OrderJsonRepository: IOrderRepository = {
  listOrders: async (filters: OrderFilters): Promise<Order[]> => {
    const filePath = path.join(__dirname, '../data/orders.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const ordersJson = JSON.parse(fileContent) as OrderJson[];
    const orders = ordersJson.map(adaptOrderFromJson);
    
    return filterOrders(orders, filters);
  }
};

