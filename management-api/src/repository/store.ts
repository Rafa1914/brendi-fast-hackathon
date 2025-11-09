
import { StoreJsonRepository } from "./db/json/storeJsonRepository";
import { IStoreRepository } from "./interface/IStoreRepository";

const StoreRepository: IStoreRepository = StoreJsonRepository;

export default StoreRepository;