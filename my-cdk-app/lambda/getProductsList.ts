import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";
import {
  DynamoDBClient,
  InternalServerError,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME;
const stockTableName = process.env.STOCK_TABLE_NAME;

export const handler: Handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log("Incoming request:", event);

  const productsCommand = new ScanCommand({ TableName: productsTableName });
  const stockCommand = new ScanCommand({ TableName: stockTableName });

  try {
    const [productsResponse, stockResponse] = await Promise.all([
      dynamoDB.send(productsCommand),
      dynamoDB.send(stockCommand),
    ]);

    const products = productsResponse.Items;
    const stock = stockResponse.Items;

    const joinedProducts = products?.map((product) => ({
      id: product.id.S,
      title: product.title.S,
      description: product.description.S,
      price: Number(product.price.N),
      count: Number(
        stock?.find((item) => item.product_id.S === product.id.S)?.count.N
      ),
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent X-Requested-With",
      },
      body: JSON.stringify(joinedProducts),
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
