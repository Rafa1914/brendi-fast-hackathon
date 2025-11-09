export interface OrderJson {
  id: string;
  uuid: string;
  code: string;
  totalPrice: number;
  products: OrderProductJson[];
  payment: OrderPaymentJson;
  delivery: OrderDeliveryJson;
  extraNotes: string;
  isScheduled: boolean;
  rewardPoints: OrderRewardPointsJson;
  createdAt: OrderTimestampJson;
  customer: OrderCustomerJson;
  motoboy?: OrderMotoboyJson;
  elapsedTimes?: OrderElapsedTimesJson;
  status: string;
  statusHistory: OrderStatusHistoryJson[];
  updatedAt: OrderTimestampJson;
}

export interface OrderProductJson {
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number | string;
  notes: string;
  isPizza: boolean;
  picture: string;
  orderCustoms: OrderCustomJson[];
  schedule?: OrderScheduleJson;
  pdvCode: string;
  categoryPath: string;
  mainCategory: string;
  requiredPoints?: number;
  isRewardable?: boolean;
}

export interface OrderCustomJson {
  type: string;
  description: string;
  chosenQuantity?: number;
  id: string;
  title: string;
  missing: boolean;
  active: boolean;
  minChoices?: number;
  maxChoices?: number;
  choices?: OrderCustomChoiceJson[];
  calculateType?: string;
  chosen?: OrderCustomChoiceJson[];
  required?: boolean;
  chosenIdx?: string;
}

export interface OrderCustomChoiceJson {
  picture: string;
  quantity: number;
  extraPrice: number;
  pdvCode: string;
  description: string;
  maxChoices?: number;
  id: string;
  title: string;
  missing: boolean;
  active: boolean;
}

export interface OrderScheduleJson {
  enabled: boolean;
  minTime: number;
}

export interface OrderPaymentJson {
  type: string;
  total: number;
}

export interface OrderDeliveryJson {
  type: string;
  address: OrderAddressJson;
  maxTime: number;
  minTime: number;
  price: number;
  priceDiscount: number;
}

export interface OrderAddressJson {
  street: string;
  number: string;
  neighborhood: string;
  geocoderNeighborhood: string;
  city: string;
  complement: string;
  referencePoint: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface OrderRewardPointsJson {
  pointsUsed: number;
  pointsEarned: number;
}

export interface OrderTimestampJson {
  _timestamp: boolean;
  seconds: number;
  nanoseconds: number;
  iso: string;
}

export interface OrderCustomerJson {
  _id: string;
  countryCode: string;
  name: string;
  phone: string;
  numberOfOrders: number;
  lastOrder: string;
}

export interface OrderMotoboyJson {
  phone: string;
  name: string;
  isActive: boolean;
}

export interface OrderElapsedTimesJson {
  timeToConfirm: number;
  timeToReady: number;
  timeToTransit: number;
  timeToDelivered: number;
}

export interface OrderStatusHistoryJson {
  status: string;
  date: string;
  changedByUserId: string;
  changedBySystem: string;
  changedReason?: string;
}

