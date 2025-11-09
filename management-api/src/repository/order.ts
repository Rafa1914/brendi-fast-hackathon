
import { OrderJsonRepository } from "./db/json/orderJsonRepository";
import { IOrderRepository } from "./interface/IOrderRepository";

const OrderRepository: IOrderRepository = OrderJsonRepository;

export default OrderRepository;

