import { OrderService } from "../service/order";
import { Request, Response } from "express";
import { OrderValidator } from "../validator/order";

async function listOrders(req: Request, res: Response) {
  const parsedQuery = OrderValidator.listOrdersSchema.query.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: parsedQuery.error.message });
  }
  try {
    const orders = await OrderService.listOrders(parsedQuery.data);
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const OrderController = {
  listOrders,
};

