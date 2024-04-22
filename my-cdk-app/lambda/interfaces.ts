export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface StockProduct extends Product {
  count: number;
}

export interface Stock {
  product_id: string;
  count: number;
}
