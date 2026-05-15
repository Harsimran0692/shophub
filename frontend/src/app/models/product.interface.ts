export interface Product {
  _id: string;
  name: string;
  images: { url: string; altText: string; _id: string }[];
  price: number;
  discountedPrice?: number;
  description: string;
  category: Category; // ObjectId as string
  isFeatured: boolean;
  isDeal: boolean;
  isAvailable: boolean;
  viewCount: number;
  stock: number;
  specs: {
    material?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: 'cm' | 'm' | 'in' | 'ft' | null;
    };
    weight?: {
      value?: number;
      unit?: 'g' | 'kg' | 'lb' | 'oz' | null;
    };
    colors?: string[];
    sizes?: string[];
  };
  reviews: {
    user: string; // ObjectId as string
    rating: number;
    comment?: string;
    createdAt: string; // ISO date string
    _id: string;
  }[];
  averageRating: number;
  totalReviews: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ProductResponse {
  status: String;
  data: {
    product: Product[];
  };
  source: String;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SpecField {
  key: string;
  label: string;
  type: 'String' | 'Number' | 'Boolean' | 'Array';
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface CategorySpec {
  _id: string;
  category: string;
  specField: SpecField[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; email: string };
  rating: number;
  comment: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  updatedAt: string;
  createdAt: string;
}
