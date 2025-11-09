import { Order, OrderFilters } from "../../../../types/order";

const filterOrders = (orders: Order[], filters: OrderFilters): Order[] => {
  let filtered = orders;

  if (filters.storeId) {
    filtered = filtered.filter((order) => order.storeId === filters.storeId);
  }

  if (filters.dateRange) {
    filtered = filtered.filter((order) => {
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
};

export const OrderUtils = {
  filterOrders,
};
