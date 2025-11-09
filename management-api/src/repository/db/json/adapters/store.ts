import { Store } from "../../../../types/store";

export interface StoreJson {
  brand: {
    id: string;
    name: string;
  };
}

export const adaptStoreFromJson = (storeJson: StoreJson): Store => {
  return {
    id: storeJson.brand.id,
    name: storeJson.brand.name,
  };
};
