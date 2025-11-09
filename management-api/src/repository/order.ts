
import { OrderJsonRepository } from "./db/orderJsonRepository";
import { IOrderRepository } from "./interface/IOrderRepository";

const OrderRepository: IOrderRepository = OrderJsonRepository;

export default OrderRepository;

