import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";
import {
  DynamoDBClient,
  InternalServerError,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { StockProduct } from "./interfaces";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME;
const stockTableName = process.env.STOCK_TABLE_NAME;

export const handler: Handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log("Incoming request:", event);

  const productId = randomUUID();
  const productData: StockProduct = JSON.parse(event.body || "{}");

  console.log("Request arguments:", productData);

  if (
    !productData.title ||
    !productData.description ||
    !productData.price ||
    !productData.count
  ) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent, X-Requested-With, Accept, Content-Length, User-Agent, Origin, Referer, Cache-Control, Cookie",
      },
      body: JSON.stringify({
        status: 400,
        message: "Missing product data",
      }),
    };
  }

  const productCommand = new PutItemCommand({
    TableName: productsTableName,
    Item: {
      id: { S: productId },
      title: { S: productData.title },
      description: { S: productData.description },
      price: { N: String(productData.price) },
    },
  });

  const stockCommand = new PutItemCommand({
    TableName: stockTableName,
    Item: {
      product_id: { S: productId },
      count: { N: String(productData.count) },
    },
  });

  try {
    await Promise.all([
      dynamoDB.send(productCommand),
      dynamoDB.send(stockCommand),
    ]);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent, X-Requested-With, Accept, Content-Length, User-Agent, Origin, Referer, Cache-Control, Cookie",
      },
      body: JSON.stringify({ id: productId }),
    };
  } catch (error) {
    console.log("Error:", error);
    throw new InternalServerError({
      message: `Failed to save Product data to DynamoDB: ${error}`,
      $metadata: {
        requestId: event.requestContext.requestId,
      },
    });
  }
};
