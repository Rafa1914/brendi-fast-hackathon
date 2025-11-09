import { Order } from "../../../../types/order";

export interface OrderJson {
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

export const adaptOrderFromJson = (orderJson: OrderJson): Order => {
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