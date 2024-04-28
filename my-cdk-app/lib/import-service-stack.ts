import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import path = require("path");

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, "ImportBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const importProductsFileLambda = new lambda.NodejsFunction(
      this,
      "ImportProductsFile",
      {
        handler: "handler",
        entry: path.join(__dirname, "../lambda/importProductsFile.ts"),
        environment: {
          BUCKET_NAME: importBucket.bucketName,
          UPLOAD_FOLDER: "uploaded",
        },
      }
    );

    importBucket.grantReadWrite(importProductsFileLambda);

    const api = new apigateway.RestApi(this, "ImportApi", {
      restApiName: "Import Service",
    });

    const importResource = api.root.addResource("import");
    const importIntegration = new apigateway.LambdaIntegration(
      importProductsFileLambda
    );
    importResource.addMethod("GET", importIntegration);
    importResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Security-Token",
        "X-Amz-User-Agent",
        "X-Requested-With",
      ],
    });

    const importFileParserLambda = new lambda.NodejsFunction(
      this,
      "importFileParser",
      {
        handler: "handler", // the exported handler function in your entry file
        entry: path.join(__dirname, "../lambda/importFileParser.ts"), // the entry file
        environment: {
          BUCKET_NAME: importBucket.bucketName,
          UPLOAD_FOLDER: "uploaded",
        },
      }
    );

    importBucket.grantReadWrite(importFileParserLambda);

    const s3EventSource = new lambdaEventSources.S3EventSource(importBucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: "uploaded" }],
    });

    importFileParserLambda.addEventSource(s3EventSource);
  }
}
