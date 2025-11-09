import { Router } from "express";
import { OrderController } from "../controller/order";

const OrderRouter = Router();

OrderRouter.get('/', OrderController.listOrders);

export default OrderRouter;

