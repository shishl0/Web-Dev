export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  images: string[];
  link: string;
}

export interface KaspiCachePayload {
  url: string;
  page: number;
  hasMore: boolean;
  fetchedAtISO: string;
  expiresAtISO: string;
  products: Product[];
}

export interface KaspiParseResponse {
  products: Product[];
  fetchedAtISO: string;
}
