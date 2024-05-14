import { SQSEvent } from "aws-lambda";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from "crypto";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const product = JSON.parse(record.body);
    console.log("product", product);

    // Validate the product data
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.count
    ) {
      console.error("Invalid product data:", product);
      continue;
    }

    // Generate a product ID
    const productId = randomUUID();
    const sqsUrl = process.env.SQS_URL;

    if (!sqsUrl) {
      throw new Error("SQS_URL is not defined");
    }

    try {
      // Save the product to the products table
      await dynamoDbClient.send(
        new PutItemCommand({
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Item: {
            id: { S: productId },
            title: { S: product.title },
            description: { S: product.description },
            price: { N: product.price.toString() },
          },
        })
      );

      // Save the stock to the stock table
      await dynamoDbClient.send(
        new PutItemCommand({
          TableName: process.env.STOCK_TABLE_NAME,
          Item: {
            product_id: { S: productId },
            count: { N: product.count.toString() },
          },
        })
      );

      // Send an email notification
      await snsClient.send(
        new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Message: `A new product has been created: ${product.title}`,
        })
      );

      // Delete the message from the queue
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_URL,
          ReceiptHandle: record.receiptHandle,
        })
      );
    } catch (error) {
      console.error("Error processing product:", error);
    }
  }
};
