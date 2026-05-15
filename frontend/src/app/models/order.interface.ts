export interface Order {
  _id: string;
  user: string;
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  address: OrderAddress;
  paymentDetails: PaymentDetails;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id: string;
  product: string | PopulatedProduct;
  name?: string;
  quantity: number;
  price: number;
}

export interface PopulatedProduct {
  _id: string;
  images: ProductImage[];
}

export interface ProductImage {
  url: string;
  altText: string;
  _id: string;
}

export interface OrderAddress {
  id: string;
  name: string;
  // address: DetailAddress;
  phone: string;
  email: string;
  streetAddress?: string;
  postalCode?: string;
  region?: string;
  country?: string;
}

export interface DetailAddress {
  streetAddress: string;
  postalCode: string;
  region: string;
  country: string;
}

export interface PaymentDetails {
  cardNumberLast4: string;
  cardholderName: string;
}

export interface CreateOrderRequest {
  addressId: string | null;
  paymentMethod: 'card' | 'cash_on_delivery' | 'wallet';
  items: OrderItem[];
}
