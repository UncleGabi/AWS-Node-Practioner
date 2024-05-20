import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
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
import * as dotenv from "dotenv";

dotenv.config();

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

    const gitPassword = process.env.UncleGabi;

    if (!gitPassword) {
      throw new Error("UncleGabi is not defined");
    }

    const basicAuthorizerLambda = new lambda.NodejsFunction(
      this,
      "basicAuthorizerLambda",
      {
        handler: "handler",
        entry: path.join(__dirname, `../lambda/basicAuthorizer.ts`),
        environment: {
          UncleGabi: gitPassword,
        },
      }
    );

    const api = createApiGateway(this);

    const basicAuthorizer = new apigateway.TokenAuthorizer(
      this,
      "basicAuthorizer",
      {
        handler: basicAuthorizerLambda,
        identitySource: "method.request.header.Authorization",
      }
    );

    basicAuthorizerLambda.addPermission("APIGatewayInvokePermission", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: api.arnForExecuteApi(),
    });

    addImportResource(api, importProductsFileLambda, basicAuthorizer);
    importBucket.grantReadWrite(importProductsFileLambda);

    // Create a SQS Queue.
    const catalogItemsQueue = new sqs.Queue(this, "catalogItemsQueue");

    // Create a SNS Topic.
    const createProductTopic = new sns.Topic(this, "createProductTopic", {
      displayName: "Create Product Topic",
    });

    const emailSubscription = new snsSubscriptions.EmailSubscription(
      "uncle.gabi@epam.com"
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
    const stockTable = dynamoDB.Table.fromTableName(
      this,
      "StockTable",
      "Stock"
    );
    productsTable.grantWriteData(catalogBatchProcessLambdaFunction);
    stockTable.grantWriteData(catalogBatchProcessLambdaFunction);

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
    importBucket.grantReadWrite(importFileParserLambda);
    addS3EventSource(importFileParserLambda, importBucket);

    const sqsSendMessagePolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [catalogItemsQueue.queueArn],
      actions: ["sqs:SendMessage"],
    });
    importFileParserLambda.addToRolePolicy(sqsSendMessagePolicyStatement);
  }
}
