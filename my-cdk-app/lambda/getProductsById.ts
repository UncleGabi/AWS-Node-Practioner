import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { products } from "./products";
import { Product } from "./interfaces";

const getProductById = (productId: string | undefined) => {
  return products.find((product) => product.id === productId);
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const productId = event.pathParameters?.productId;
  const product: Product | undefined = await new Promise((resolve) =>
    setTimeout(() => resolve(getProductById(productId)), 1000)
  );

  if (!product) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({
        status: 404,
        message: "Product not found",
      }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(product),
  };
};
