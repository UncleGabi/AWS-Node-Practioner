import { APIGatewayProxyResultV2 } from "aws-lambda";

import { products } from "./products";
import { Product } from "./interfaces";

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  const productList: Product[] = await new Promise((resolve) =>
    setTimeout(() => resolve(products), 1000)
  );
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(productList),
  };
};
