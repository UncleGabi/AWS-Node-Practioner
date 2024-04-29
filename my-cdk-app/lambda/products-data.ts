import { Product, Stock } from "./interfaces";

const generateRandomStockNumber = (): number => {
  return Math.floor(Math.random() * 21);
};

export const products: Product[] = [
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    title: "ProductOne",
    description: "Short Product Description1",
    price: 24,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    title: "ProductTitle",
    description: "Short Product Description7",
    price: 15,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    title: "Product",
    description: "Short Product Description2",
    price: 23,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    title: "ProductTest",
    description: "Short Product Description4",
    price: 15,
  },
  {
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    title: "Product2",
    description: "Short Product Descriptio1",
    price: 23,
  },
  {
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    title: "ProductName",
    description: "Short Product Description7",
    price: 15,
  },
];

export const stockData: Stock[] = products.map((product) => ({
  product_id: product.id,
  count: generateRandomStockNumber(),
}));
