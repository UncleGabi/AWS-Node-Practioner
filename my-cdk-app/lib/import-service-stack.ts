import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import {
  createImportBucket,
  createLambdaFunction,
  createApiGateway,
  addImportResource,
  addS3EventSource,
} from "./import-service.utils";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = createImportBucket(this);

    const importProductsFileLambda = createLambdaFunction(
      this,
      importBucket,
      "ImportProductsFile",
      "importProductsFile"
    );

    const api = createApiGateway(this);

    addImportResource(api, importProductsFileLambda);

    // const importFileParserLambda = createLambdaFunction(
    //   this,
    //   importBucket,
    //   "importFileParser",
    //   "importFileParser"
    // );

    // addS3EventSource(importFileParserLambda, importBucket);

    // Create a SQS Queue.
    const catalogItemsQueue = new sqs.Queue(this, "catalogItemsQueue");

    // catalogItemsQueue.grantSendMessages(importFileParserLambda);

    // Create a SNS Topic.
    const createProductTopic = new sns.Topic(this, "createProductTopic", {
      displayName: "Create Product Topic",
    });

    const emailSubscription = new snsSubscriptions.EmailSubscription(
      "uncle.gabi92@epam.com"
    );

    createProductTopic.addSubscription(emailSubscription);

    const catalogBatchProcessLambdaFunction = new lambda.NodejsFunction(
      this,
      "catalogBatchProcess",
      {
        handler: "handler",
        entry: path.join(__dirname, "../lambda/catalogBatchProcess.ts"),
        environment: {
          PRODUCTS_TABLE_NAME: "Products",
          STOCK_TABLE_NAME: "Stock",
          SQS_URL: catalogItemsQueue.queueUrl,
          SNS_TOPIC_ARN: createProductTopic.topicArn,
        },
      }
    );

    createProductTopic.grantPublish(catalogBatchProcessLambdaFunction);

    const productsTable = dynamoDB.Table.fromTableName(
      this,
      "ProductsTable",
      "Products"
    );
    productsTable.grantWriteData(catalogBatchProcessLambdaFunction);

    catalogBatchProcessLambdaFunction.addEventSource(
      new SqsEventSource(catalogItemsQueue, { batchSize: 5 })
    );

    const importFileParserLambda = new lambda.NodejsFunction(
      this,
      "importFileParser",
      {
        handler: "handler",
        entry: path.join(__dirname, "../lambda/importFileParser.ts"),
        environment: {
          SQS_URL: catalogItemsQueue.queueUrl,
        },
      }
    );

    const sqsSendMessagePolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [catalogItemsQueue.queueArn],
      actions: ["sqs:SendMessage"],
    });
    importFileParserLambda.addToRolePolicy(sqsSendMessagePolicyStatement);

    importBucket.grantReadWrite(importFileParserLambda);

    addS3EventSource(importFileParserLambda, importBucket);
  }
}
