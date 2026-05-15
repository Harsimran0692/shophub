export interface Cart {
  status: string;
  data: CartData;
}

export interface CartData {
  _id: string;
  user: string; // ObjectId as string
  items: CartItem[];
  totalPrice: number; // Matches backend totalPrice
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CartItem {
  _id: string;
  product: Product; // Populated product details
  quantity: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: ProductImages[]; // Adjust based on your images field structure
  category: Category;
  isAvailable: boolean; // From backend population
  stock: number; // From backend population
}

export interface ProductImages {
  url: string;
  altText: string;
  _id: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartId: string;
  quantity: number;
}
