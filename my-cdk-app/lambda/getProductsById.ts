import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";
import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  InternalServerError,
} from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME;
const stockTableName = process.env.STOCK_TABLE_NAME;

export const handler: Handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log("Incoming request:", event);

  const productId = event.pathParameters?.productId;

  console.log("Product ID:", productId);

  if (!productId) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent X-Requested-With",
      },
      body: JSON.stringify({
        status: 404,
        message: "Product not found",
      }),
    };
  }

  const productItemCommand = new GetItemCommand({
    TableName: productsTableName,
    Key: { id: { S: productId } },
  });

  const stockItemCommand = new GetItemCommand({
    TableName: stockTableName,
    Key: { product_id: { S: productId } },
  });

  try {
    const [productItemResponse, stockItemResponse] = await Promise.all([
      dynamoDB.send(productItemCommand),
      dynamoDB.send(stockItemCommand),
    ]);

    const productItem = productItemResponse.Item as Record<
      string,
      AttributeValue
    >;
    const stockItem = stockItemResponse.Item as Record<string, AttributeValue>;

    const joinedProductItem = {
      ...productItem,
      id: productId,
      title: productItem.title.S,
      description: productItem.description.S,
      price: Number(productItem.price.N),
      count: Number(stockItem?.count.N),
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent X-Requested-With",
      },
      body: JSON.stringify(joinedProductItem),
    };
  } catch (error) {
    console.log("Error:", error);
    throw new InternalServerError({
      message: `Failed to get Product by given ID from DynamoDB: ${error}`,
      $metadata: {
        requestId: event.requestContext.requestId,
      },
    });
  }
};
