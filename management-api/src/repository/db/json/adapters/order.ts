import { Order, OrderType } from "../../../../types/order";
import { OrderJson } from "../types/order";

const getOrderType = (type: string): OrderType => {
  switch (type) {
    case "delivery":
      return OrderType.DELIVERY;
    case "pickup":
      return OrderType.PICKUP;
    default:
      return OrderType.OTHER;
  }
};

export const adaptOrderFromJson = (orderJson: OrderJson): Order => {
  // Converter createdAt
  let createdAt: Date;
  if (typeof orderJson.createdAt === "number") {
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
    type: getOrderType(orderJson.delivery.type),
    customer: {
      name: orderJson.customer.name,
      phone: orderJson.customer.phone,
    },
    totalPrice: orderJson.totalPrice,
    products: orderJson.products.map((product) => ({
      id: product.productId,
      name: product.name,
      price: product.price,
      quantity: typeof product.quantity === 'string' ? parseInt(product.quantity) : product.quantity,
    })),
    createdAt,
    elapsedTimes: orderJson.elapsedTimes ? {
      timeToConfirm: orderJson.elapsedTimes.timeToConfirm,
      timeToReady: orderJson.elapsedTimes.timeToReady,
      timeToTransit: orderJson.elapsedTimes.timeToTransit,
      timeToDelivered: orderJson.elapsedTimes.timeToDelivered,
    } : undefined,
  };
};
