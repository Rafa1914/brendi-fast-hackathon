import StoreRepository from "../repository/store";
import { Store } from "../types/store";

async function getStore(id: string): Promise<Store> {
  return await StoreRepository.getStore(id);
}

export const StoreService = {
  getStore,
};