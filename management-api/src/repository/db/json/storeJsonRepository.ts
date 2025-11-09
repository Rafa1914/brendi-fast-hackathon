import { IStoreRepository } from "../../interface/IStoreRepository";
import { Store } from "../../../types/store";
import * as fs from 'fs/promises';
import * as path from 'path';
import { adaptStoreFromJson, StoreJson } from "./adapters/store";



export const StoreJsonRepository: IStoreRepository = {
  getStore: async (id: string): Promise<Store> => {
    const filePath = path.join(__dirname, '../../data/store.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const storeJson = JSON.parse(fileContent) as StoreJson;
    const store = adaptStoreFromJson(storeJson);
    
    if (store.id !== id) {
      throw new Error(`Store with id ${id} not found`);
    }
    
    return store;
  }
};