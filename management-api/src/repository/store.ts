
import { StoreJsonRepository } from "./db/storeJsonRepository";
import { IStoreRepository } from "./interface/IStoreRepository";

const StoreRepository: IStoreRepository = StoreJsonRepository;

export default StoreRepository;