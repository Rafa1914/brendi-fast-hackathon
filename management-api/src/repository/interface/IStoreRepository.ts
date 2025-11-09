import { Store } from "../../types/store";

export interface IStoreRepository {
  getStore(id: string): Promise<Store>;
}