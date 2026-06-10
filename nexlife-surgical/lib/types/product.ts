export interface ProductImage {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface DynamicField {
  key: string;
  value: string;
  hidden?: boolean;
}

export interface Product {
  _id: string;
  slug?: string;
  name: string;
  category: string;
  siteContext: 'surgical' | 'general' | 'both';
  images: ProductImage[];
  visible: boolean;
  hidePrice?: boolean;
  price?: string;
  priceUnit?: string;
  fields?: DynamicField[];
  isFeatured?: boolean;
  isStarred?: boolean;
  sequence?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  siteContext: 'surgical' | 'general' | 'both';
  visible: boolean;
  sequence?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  total: number;
  page?: number;
  limit?: number;
  items: Product[];
}

export interface CategoriesResponse {
  total: number;
  items: Category[];
}

export type Site = 'surgical' | 'general';
